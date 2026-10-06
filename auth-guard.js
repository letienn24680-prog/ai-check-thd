/**
 * AI CHECK THĐ - Auth & Access Helper
 * Đảm bảo trải nghiệm liền mạch cho cả học sinh (Khách/Thành viên) và Quản trị viên (Giáo viên)
 * Không chặn quyền truy cập dữ liệu, bài học hay nghiên cứu trước đó của học sinh
 */
(() => {
  const currentPath = (location.pathname || "").toLowerCase().replace(/\\/g, "/");
  const isAuthPage = currentPath.includes("login.html");
  const isAdminPage = currentPath.includes("admin.html");

  async function checkAuthStatus() {
    if (typeof window.AICheckCloud === "undefined") {
      setTimeout(checkAuthStatus, 100);
      return;
    }

    try {
      const user = await window.AICheckCloud.getUser();
      
      // Đồng bộ tên hiển thị nếu đã đăng nhập
      if (user) {
        const displayName = user.user_metadata?.display_name || user.email?.split("@")[0];
        if (displayName && !localStorage.getItem("aicheck:player")) {
          localStorage.setItem("aicheck:player", JSON.stringify(displayName));
        }
      }

      // Đối với trang Admin: Kiểm tra quyền quản trị
      if (isAdminPage) {
        const isUnlocked = localStorage.getItem("aicheck:admin_unlocked") === "true";
        const isAdminUser = user && window.AICheckCloud.isAdmin(user);
        if (!isAdminUser && !isUnlocked && !user) {
          // Lưu trang định truy cập để quay lại sau khi đăng nhập
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
