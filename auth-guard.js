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

  // Kiểm tra nhanh token Supabase trong localStorage để chuyển hướng tức thì (Zero-Flicker)
  function hasLocalAuthToken() {
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
      const user = await window.AICheckCloud.getUser();

      // BẢO VỆ TRANG CHỦ: Nếu không có user hợp lệ từ Cloud -> Chuyển hướng sang login.html
      if (isHomePage && !user) {
        try {
          localStorage.setItem("aicheck:redirectAfterLogin", "index.html");
        } catch {}
        location.replace(loginUrl);
        return;
      }

      // Đồng bộ tên hiển thị nếu đã đăng nhập
      if (user) {
        const displayName = user.user_metadata?.display_name || user.email?.split("@")[0];
        if (displayName && !localStorage.getItem("aicheck:player")) {
          localStorage.setItem("aicheck:player", JSON.stringify(displayName));
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
