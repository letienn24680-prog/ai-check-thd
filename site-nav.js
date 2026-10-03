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
})();
