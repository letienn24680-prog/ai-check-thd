(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Đóng menu điều hướng" : "Mở menu điều hướng");
    toggle.querySelector("span").textContent = open ? "×" : "☰";
  }

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", event => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("click", event => {
    if (toggle.getAttribute("aria-expanded") === "true" && !event.target.closest(".header-inner")) setOpen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setOpen(false);
  });

  // Gắn liên kết Đăng nhập / Trạng thái tài khoản vào thanh điều hướng
  async function attachAuthBadge() {
    if (document.getElementById("navAuthContainer")) return;
    const isPagesDir = location.pathname.includes("/pages/");
    const loginHref = isPagesDir ? "../login.html" : "login.html";
    const adminHref = isPagesDir ? "../admin.html" : "admin.html";

    const container = document.createElement("span");
    container.id = "navAuthContainer";
    container.className = "nav-auth-item";

    let user = null;
    if (window.AICheckCloud?.getUser) {
      try { user = await window.AICheckCloud.getUser(); } catch {}
    }

    if (user) {
      const name = user.user_metadata?.display_name || user.email?.split("@")[0] || "Thành viên";
      const isAdmin = window.AICheckCloud?.isAdmin ? window.AICheckCloud.isAdmin(user) : false;
      container.innerHTML = `
        <span class="nav-user-pill">
          <span>👤 ${escapeHtml(name.slice(0, 15))}</span>
          ${isAdmin ? `<a href="${adminHref}" style="color:var(--leaf);text-decoration:none;font-weight:800;margin-left:4px" title="Quản trị">[Admin]</a>` : ""}
          <span class="nav-user-logout" title="Đăng xuất" id="btnNavLogout">✕</span>
        </span>
      `;
      nav.append(container);
      document.getElementById("btnNavLogout")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (confirm("Bạn có chắc muốn đăng xuất?")) {
          await window.AICheckCloud.signOut();
        }
      });
    } else {
      let localName = "";
      try { localName = JSON.parse(localStorage.getItem("aicheck:player") || '""'); } catch {}
      container.innerHTML = `
        <a href="${loginHref}" class="nav-auth-link" title="Đăng nhập hoặc Đăng ký">${localName ? `👤 ${escapeHtml(localName.slice(0, 12))}` : "Đăng nhập ↗"}</a>
      `;
      nav.append(container);
    }
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachAuthBadge);
  } else {
    setTimeout(attachAuthBadge, 150);
  }
})();
