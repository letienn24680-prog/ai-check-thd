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
    } catch (e) {
      console.warn("Lỗi kiểm tra auth:", e);
    }
  }

  // Khởi chạy khi tài liệu sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAuthStatus);
  } else {
    checkAuthStatus();
  }
})();
