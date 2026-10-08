/**
 * AI CHECK THĐ - Auth Guard & Access Control
 * Quy tắc bảo vệ: Người dùng BẮT BUỘC phải đăng nhập tài khoản mới được vào Trang chủ (index.html).
 * Nếu chưa đăng nhập: Tự động chuyển hướng ngay sang login.html và lưu trang đích để quay lại.
 */
(() => {
  const currentPath = (location.pathname || "").toLowerCase().replace(/\\/g, "/");
  const isAuthPage = currentPath.includes("login.html") || currentPath.includes("reset-password.html");
  const isAdminPage = currentPath.includes("admin.html");
  const isPagesDir = currentPath.includes("/pages/");
  const loginUrl = isPagesDir ? "../login.html" : "login.html";

  // Xác định trang chủ
  const isHomePage = currentPath.endsWith("index.html") || 
                     currentPath.endsWith("/") || 
                     currentPath === "" || 
                     currentPath.endsWith("du-an-khkt") ||
                     currentPath.endsWith("du-an-khkt/");

  // Kiểm tra nhanh token Supabase trong localStorage hoặc URL OAuth callback để chuyển hướng tức thì (Zero-Flicker)
  function hasLocalAuthToken() {
    // 0. Kiểm tra tài khoản Quản trị viên cấp cao (adminthd)
    try {
      if (sessionStorage.getItem("aicheck:master_admin_session") || localStorage.getItem("aicheck:master_admin_session")) {
        return true;
      }
    } catch {}

    // 1. Kiểm tra nếu URL đang mang token hoặc authorization code từ Google / Facebook OAuth callback
    try {
      if (location.hash && (location.hash.includes("access_token") || location.hash.includes("refresh_token"))) {
        return true;
      }
      if (location.search && (location.search.includes("code=") || location.search.includes("token="))) {
        return true;
      }
    } catch {}

    // 2. Kiểm tra token đã lưu trong localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
          const raw = localStorage.getItem(k);
          if (raw && (raw.includes("access_token") || raw.includes("currentSession"))) {
            return true;
          }
        }
      }
    } catch {}
    return false;
  }

  // 🛑 NẾU VÀO TRANG CHỦ MÀ CHƯA CÓ TOKEN -> CHUYỂN HƯỚNG TỨC THÌ SANG LOGIN.HTML
  if (isHomePage && !hasLocalAuthToken()) {
    try {
      localStorage.setItem("aicheck:redirectAfterLogin", "index.html");
    } catch {}
    location.replace(loginUrl);
    return;
  }

  async function checkAuthStatus() {
    if (typeof window.AICheckCloud === "undefined" || !window.AICheckCloud.getUser) {
      setTimeout(checkAuthStatus, 60);
      return;
    }

    try {
      const isOAuthCallback = (location.hash && location.hash.includes("access_token")) || 
                              (location.search && location.search.includes("code="));

      let user = await window.AICheckCloud.getUser();
      // Nếu vừa từ Google/Facebook OAuth redirect về, đợi thêm một lát để client Supabase xử lý hash/code
      if (!user && isOAuthCallback) {
        await new Promise(r => setTimeout(r, 350));
        user = await window.AICheckCloud.getUser();
      }

      // BẢO VỆ TRANG CHỦ: Nếu không có user hợp lệ từ Cloud -> Chuyển hướng sang login.html
      if (isHomePage && !user) {
        try {
          localStorage.setItem("aicheck:redirectAfterLogin", "index.html");
        } catch {}
        location.replace(loginUrl);
        return;
      }

      // Đồng bộ thông tin cá nhân từ Google/Facebook OAuth vào hồ sơ
      if (user) {
        // Làm sạch URL (xóa hash access_token trên thanh địa chỉ để URL gọn gàng)
        if (location.hash && location.hash.includes("access_token")) {
          try {
            history.replaceState(null, "", location.pathname + location.search);
          } catch {}
        }

        const displayName = user.user_metadata?.full_name || 
                            user.user_metadata?.name || 
                            user.user_metadata?.display_name || 
                            user.email?.split("@")[0] || "";
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        if (displayName && !localStorage.getItem("aicheck:player")) {
          try { localStorage.setItem("aicheck:player", JSON.stringify(displayName.trim().slice(0, 24))); } catch {}
        }

        let localProf = {};
        try { localProf = JSON.parse(localStorage.getItem("aicheck:user_profile") || "{}"); } catch {}
        let profUpdated = false;

        if (!localProf.display_name && displayName) {
          localProf.display_name = displayName;
          profUpdated = true;
        }
        if (!localProf.avatar && avatarUrl) {
          localProf.avatar = avatarUrl;
          profUpdated = true;
          try { localStorage.setItem("aicheck:avatar", avatarUrl); } catch {}
        }
        if (profUpdated) {
          try { localStorage.setItem("aicheck:user_profile", JSON.stringify(localProf)); } catch {}
          window.dispatchEvent(new CustomEvent("aicheck:profile-updated", { detail: { user } }));
        }
      }

      // Đối với trang Admin: Kiểm tra quyền quản trị
      if (isAdminPage) {
        const isUnlocked = sessionStorage.getItem("aicheck:admin_unlocked") === "true";
        const isAdminUser = user && window.AICheckCloud.isAdmin(user);
        if (!isAdminUser && !isUnlocked && !user) {
          localStorage.setItem("aicheck:redirectAfterLogin", location.href);
        }
      }

      // 4. KÍCH HOẠT WATCHDOG BẢO VỆ PHIÊN DUY NHẤT & TRANH CHẤP THIẾT BỊ
      if (user && !isAuthPage) {
        initSessionWatchdog(user);
      }
    } catch (e) {
      console.warn("Lỗi kiểm tra auth:", e);
    }
  }

  // =========================================================================
  // WATCHDOG BẢO MẬT: 1 TÀI KHOẢN CHỈ ĐĂNG NHẬP 1 THIẾT BỊ
  // =========================================================================
  let watchdogTimer = null;
  let isWatchdogChecking = false;

  function initSessionWatchdog(user) {
    if (watchdogTimer) clearInterval(watchdogTimer);
    const email = user.email || localStorage.getItem("aicheck:active_account") || "";
    if (!email) return;

    // A. Kiểm tra ngay lập tức
    checkDeviceSession(email);

    // B. Lắng nghe qua BroadcastChannel (thời gian thực giữa các tab/cửa sổ/thiết bị cùng origin)
    try {
      if (window.BroadcastChannel) {
        const ch = new BroadcastChannel("aicheck_session_channel");
        ch.onmessage = (evt) => {
          const msg = evt.data;
          if (!msg || !msg.account) return;
          const currentAcc = email.toLowerCase().trim();
          if (msg.account.toLowerCase().trim() === currentAcc) {
            if (msg.type === "SESSION_DISPLACED") {
              const mySessId = localStorage.getItem("aicheck:active_session_id");
              if (msg.newSessionId && msg.newSessionId !== mySessId) {
                showDisplacedModal(email, msg.newDeviceInfo);
              }
            } else if (msg.type === "ACCOUNT_LOCKED_CONFLICT") {
              showLockedModal(email, msg.lock);
            } else if (msg.type === "ACCOUNT_LOCK_UPDATE") {
              if (msg.lock?.status === "locked") {
                showLockedModal(email, msg.lock);
              }
            }
          }
        };
      }
    } catch {}

    // C. Lắng nghe qua storage event (đồng bộ trên các tab/cửa sổ)
    window.addEventListener("storage", (e) => {
      if (e.key === "aicheck:session_event" || e.key === "aicheck:account_locks" || e.key === "aicheck:account_sessions") {
        checkDeviceSession(email);
      }
    });

    // D. Kiểm tra khi người dùng quay lại tab (focus / visibilitychange)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkDeviceSession(email);
    });
    window.addEventListener("focus", () => checkDeviceSession(email));

    // E. Định kỳ kiểm tra mỗi 3.5 giây
    watchdogTimer = setInterval(() => checkDeviceSession(email), 3500);
  }

  function checkDeviceSession(email) {
    if (isWatchdogChecking || isAuthPage) return;
    const mgr = window.AICheckSessionManager;
    if (!mgr) return;

    isWatchdogChecking = true;
    try {
      const res = mgr.checkCurrentDeviceSession(email);
      if (res.locked) {
        showLockedModal(email, res.lock);
      } else if (res.displaced) {
        showDisplacedModal(email, res.newDevice);
      }
    } catch (err) {
      console.warn("Lỗi kiểm tra session watchdog:", err);
    } finally {
      isWatchdogChecking = false;
    }
  }

  // MODAL 1: THÔNG BÁO BỊ ĐĂNG XUẤT DO THIẾT BỊ KHÁC ĐĂNG NHẬP
  function showDisplacedModal(account, newDevice) {
    if (document.getElementById("sessionDisplacedModal")) return;

    // Xóa token đăng nhập cục bộ
    try {
      localStorage.removeItem("aicheck:active_session_id");
      localStorage.removeItem("aicheck:active_account");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
          localStorage.removeItem(k);
        }
      }
      sessionStorage.removeItem("aicheck:admin_unlocked");
      sessionStorage.removeItem("aicheck:master_admin_session");
    } catch {}

    const devName = newDevice || "Thiết bị / Trình duyệt khác";
    const modal = document.createElement("div");
    modal.id = "sessionDisplacedModal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Be Vietnam Pro',sans-serif;";
    modal.innerHTML = `
      <div style="background:#ffffff;border-radius:18px;max-width:480px;width:100%;padding:28px 24px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.35);border:1px solid #e2e8f0;animation:fadeIn 0.25s ease-out">
        <div style="width:64px;height:64px;background:#fef2f2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:30px;border:2px solid #fee2e2">
          ⚠️
        </div>
        <span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#fee2e2;color:#b91c1c;font-size:11px;font-weight:800;letter-spacing:0.5px;margin-bottom:8px">
          QUY TẮC 1 TÀI KHOẢN / 1 THIẾT BỊ
        </span>
        <h3 style="margin:0 0 10px;color:#0f172a;font-size:19px;font-weight:800;font-family:'Space Grotesk',sans-serif">
          Tài khoản đã đăng nhập trên thiết bị khác
        </h3>
        <p style="margin:0 0 16px;font-size:13px;color:#475569;line-height:1.6;text-align:left;background:#f8fafc;padding:14px;border-radius:10px;border:1px solid #e2e8f0">
          Tài khoản <strong>${escapeHtml(account)}</strong> vừa được đăng nhập trên một thiết bị khác (<strong>${escapeHtml(devName)}</strong>).
          <br><br>
          Quy định bảo mật hệ thống: <strong>Mỗi tài khoản chỉ được phép đăng nhập trên 1 thiết bị duy nhất</strong>. Thiết bị này đã tự động đăng xuất để bảo vệ dữ liệu và kết quả bài làm của bạn.
        </p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <a href="${loginUrl}?reason=displaced" style="display:block;padding:11px 22px;background:#151717;color:#ffffff;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.15)">
            Đăng nhập lại trên thiết bị này →
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // MODAL 2: THÔNG BÁO TÀI KHOẢN BỊ KHÓA DO TRANH CHẤP LIÊN TỤC
  function showLockedModal(account, lockData) {
    if (document.getElementById("sessionLockedModal")) return;

    // Xóa session
    try {
      localStorage.removeItem("aicheck:active_session_id");
      localStorage.removeItem("aicheck:active_account");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
          localStorage.removeItem(k);
        }
      }
    } catch {}

    const modal = document.createElement("div");
    modal.id = "sessionLockedModal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,0.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Be Vietnam Pro',sans-serif;";
    modal.innerHTML = `
      <div style="background:#ffffff;border-radius:18px;max-width:520px;width:100%;padding:28px 24px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.4);border:2px solid #fca5a5;animation:fadeIn 0.25s ease-out">
        <div style="width:68px;height:68px;background:#fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;border:2px solid #fecaca">
          🚨
        </div>
        <span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#fee2e2;color:#b91c1c;font-size:11px;font-weight:800;letter-spacing:0.5px;margin-bottom:8px">
          BẢO VỆ TÀI KHOẢN KHẨN CẤP
        </span>
        <h3 style="margin:0 0 10px;color:#991b1b;font-size:20px;font-weight:800;font-family:'Space Grotesk',sans-serif">
          Tài khoản tạm khóa do tranh chấp thiết bị
        </h3>
        <p style="margin:0 0 18px;font-size:13px;color:#334155;line-height:1.6;text-align:left;background:#fef2f2;padding:14px;border-radius:10px;border:1px solid #fecaca">
          Hệ thống phát hiện tài khoản <strong>${escapeHtml(account)}</strong> đang xảy ra <strong>tranh chấp đăng nhập liên tục giữa 2 thiết bị</strong> (đổi phiên liên tục nhiều lần).
          <br><br>
          Để ngăn chặn hành vi sử dụng trái phép và bảo vệ kết quả học tập của bạn, tài khoản đã được <strong>tạm khóa an toàn</strong>.
          <br><br>
          👉 Vui lòng điền <strong>Biểu mẫu hỗ trợ mở khóa tài khoản</strong> bên dưới để Ban Quản trị xác minh danh tính và cấp mã mở khóa.
        </p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button type="button" id="btnOpenUnlockFormGuard" style="padding:11px 22px;background:#b91c1c;color:#ffffff;border:none;border-radius:10px;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 4px 14px rgba(185,28,28,0.3)">
            📝 Điền Biểu mẫu Hỗ trợ Mở khóa
          </button>
          <a href="${loginUrl}" style="padding:11px 18px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none">
            Về trang Đăng nhập
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("btnOpenUnlockFormGuard")?.addEventListener("click", () => {
      openUnlockSupportModal(account);
    });
  }

  // MODAL 3: BIỂU MẪU BẮT BUỘC ĐIỀN ĐỦ THÔNG TIN ĐỂ XÁC MINH MỞ KHÓA
  window.openUnlockSupportModal = function(accountEmail = "") {
    let existingModal = document.getElementById("unlockSupportFormModal");
    if (!existingModal) {
      existingModal = document.createElement("div");
      existingModal.id = "unlockSupportFormModal";
      existingModal.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:1000000;display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Be Vietnam Pro',sans-serif;overflow-y:auto;";
      existingModal.innerHTML = `
        <div style="background:#ffffff;border-radius:18px;max-width:540px;width:100%;padding:26px 24px;box-shadow:0 25px 60px rgba(0,0,0,0.4);border:1px solid #e2e8f0;max-height:90vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e2e8f0">
            <h3 style="margin:0;font-size:17px;font-weight:800;color:#0f172a;display:flex;align-items:center;gap:6px">
              <span>📋</span> Biểu mẫu Hỗ trợ Mở khóa Tài khoản
            </h3>
            <button type="button" onclick="closeUnlockSupportModal()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#64748b;padding:2px 8px">✕</button>
          </div>

          <p style="font-size:12px;color:#64748b;margin:0 0 16px;line-height:1.5">
            ⚠️ <em>Biểu mẫu này bắt buộc điền đầy đủ tất cả các trường. Ban Quản trị sẽ đối chiếu trực tiếp các trường thông tin này với hồ sơ đã lưu trong cơ sở dữ liệu để cấp mã mở khóa về email của bạn.</em>
          </p>

          <form id="formUnlockSupportReq" onsubmit="submitUnlockSupportForm(event)">
            <div style="display:grid;gap:12px;margin-bottom:16px">
              <div>
                <label style="display:block;font-size:11px;font-weight:800;color:#1e293b;margin-bottom:4px">1️⃣ GMAIL / TÀI KHOẢN BỊ KHÓA (*):</label>
                <input type="email" id="reqUnlockEmail" required placeholder="Nhập Gmail tài khoản bị khóa..." style="width:100%;height:38px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box">
              </div>

              <div>
                <label style="display:block;font-size:11px;font-weight:800;color:#1e293b;margin-bottom:4px">2️⃣ HỌ VÀ TÊN / BIỆT DANH ĐÃ ĐĂNG KÝ (*):</label>
                <input type="text" id="reqUnlockName" required placeholder="Biệt danh hoặc họ tên hiển thị..." style="width:100%;height:38px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box">
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                <div>
                  <label style="display:block;font-size:11px;font-weight:800;color:#1e293b;margin-bottom:4px">3️⃣ LỚP / KHỐI HỌC (*):</label>
                  <input type="text" id="reqUnlockClass" required placeholder="VD: 12A5, 11A1 THĐ..." style="width:100%;height:38px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box">
                </div>
                <div>
                  <label style="display:block;font-size:11px;font-weight:800;color:#1e293b;margin-bottom:4px">4️⃣ THIẾT BỊ CHÍNH CHỦ (*):</label>
                  <input type="text" id="reqUnlockDevice" required placeholder="VD: Laptop Asus, iPhone 12..." style="width:100%;height:38px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box">
                </div>
              </div>

              <div>
                <label style="display:block;font-size:11px;font-weight:800;color:#1e293b;margin-bottom:4px">5️⃣ MẬT KHẨU HOẶC MÃ XÁC MINH BÍ MẬT (*):</label>
                <input type="password" id="reqUnlockPassword" required placeholder="Nhập mật khẩu bạn đã đăng ký để xác minh..." style="width:100%;height:38px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box">
                <small style="color:#64748b;font-size:10.5px">Thông tin mật khẩu giúp Admin chắc chắn bạn là chủ sở hữu hợp pháp</small>
              </div>

              <div>
                <label style="display:block;font-size:11px;font-weight:800;color:#1e293b;margin-bottom:4px">6️⃣ TRÌNH BÀY CHI TIẾT SỰ CỐ TRANH CHẤP (*):</label>
                <textarea id="reqUnlockReason" required rows="3" placeholder="Em đang làm bài trên máy tính thì bạn/em ở nhà cũng đăng nhập vào điện thoại, dẫn đến việc bị tranh chấp phiên..." style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:12.5px;box-sizing:border-box;font-family:inherit"></textarea>
              </div>

              <div style="background:#f8fafc;padding:10px 12px;border-radius:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">
                <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer">
                  <input type="checkbox" id="reqUnlockConfirm" required style="margin-top:2px">
                  <span>Tôi cam đoan thông tin trên là chính xác và cam kết không chia sẻ tài khoản cho người khác dùng chung.</span>
                </label>
              </div>
            </div>

            <div id="unlockFormMsg" style="display:none;margin-bottom:12px;font-size:12px;padding:8px 12px;border-radius:6px"></div>

            <div style="display:flex;justify-content:flex-end;gap:10px">
              <button type="button" onclick="closeUnlockSupportModal()" style="padding:9px 16px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">
                Hủy bỏ
              </button>
              <button type="submit" id="btnSubmitUnlockForm" style="padding:9px 20px;background:#b91c1c;color:#ffffff;border:none;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 3px 10px rgba(185,28,28,0.25)">
                🚀 Gửi biểu mẫu xác minh tới Admin
              </button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(existingModal);
    }

    if (accountEmail) {
      const emailInput = document.getElementById("reqUnlockEmail");
      if (emailInput) emailInput.value = accountEmail;
    }

    existingModal.style.display = "flex";
  };

  window.closeUnlockSupportModal = function() {
    const modal = document.getElementById("unlockSupportFormModal");
    if (modal) modal.style.display = "none";
  };

  window.submitUnlockSupportForm = async function(evt) {
    evt.preventDefault();
    const email = document.getElementById("reqUnlockEmail")?.value.trim();
    const name = document.getElementById("reqUnlockName")?.value.trim();
    const sClass = document.getElementById("reqUnlockClass")?.value.trim();
    const sDevice = document.getElementById("reqUnlockDevice")?.value.trim();
    const sPass = document.getElementById("reqUnlockPassword")?.value.trim();
    const sReason = document.getElementById("reqUnlockReason")?.value.trim();
    const isConfirmed = document.getElementById("reqUnlockConfirm")?.checked;
    const msgBox = document.getElementById("unlockFormMsg");
    const submitBtn = document.getElementById("btnSubmitUnlockForm");

    if (!email || !name || !sClass || !sDevice || !sPass || !sReason || !isConfirmed) {
      if (msgBox) {
        msgBox.style.display = "block";
        msgBox.style.background = "#fee2e2";
        msgBox.style.color = "#b91c1c";
        msgBox.textContent = "⚠️ Vui lòng điền đầy đủ tất cả 6 trường thông tin bắt buộc và xác nhận cam đoan!";
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang gửi biểu mẫu…";
    }

    const structuredReason = `[TRANH CHẤP THIẾT BỊ / MỞ KHÓA]
• Lớp/Khối: ${sClass}
• Thiết bị chính chủ: ${sDevice}
• Mật khẩu/Xác minh: ${sPass}
• Trình bày sự cố: ${sReason}`;

    try {
      if (window.AICheckCloud?.sendSupportRequest) {
        await window.AICheckCloud.sendSupportRequest(email, name, structuredReason);
      }

      // Đánh dấu tài khoản đã gửi yêu cầu
      if (window.AICheckSessionManager) {
        const lock = window.AICheckSessionManager.getAccountLock(email) || {};
        window.AICheckSessionManager.setAccountLock(email, {
          ...lock,
          status: "locked",
          requestSubmitted: true,
          submittedAt: Date.now(),
          formDetails: {
            email, name, sClass, sDevice, sPass, sReason
          }
        });
      }

      if (msgBox) {
        msgBox.style.display = "block";
        msgBox.style.background = "#ecfdf5";
        msgBox.style.color = "#047857";
        msgBox.innerHTML = "✓ <strong>Đã gửi biểu mẫu thành công!</strong> Ban Quản trị sẽ đối chiếu thông tin và gửi mã mở khóa về email của bạn. Sau khi nhận được mã, vui lòng vào trang Đăng nhập để nhập mã và mở khóa.";
      }

      setTimeout(() => {
        closeUnlockSupportModal();
        location.href = `${loginUrl}?reason=unlock_submitted&email=${encodeURIComponent(email)}`;
      }, 3500);
    } catch (e) {
      if (msgBox) {
        msgBox.style.display = "block";
        msgBox.style.background = "#fee2e2";
        msgBox.style.color = "#b91c1c";
        msgBox.textContent = "Lỗi gửi biểu mẫu: " + (e.message || "Vui lòng thử lại sau.");
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "🚀 Gửi biểu mẫu xác minh tới Admin";
      }
    }
  };

  function escapeHtml(text) {
    const d = document.createElement("div");
    d.textContent = text || "";
    return d.innerHTML;
  }

  // Khởi chạy khi tài liệu sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAuthStatus);
  } else {
    checkAuthStatus();
  }
})();
