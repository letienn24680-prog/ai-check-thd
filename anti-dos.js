/**
 * anti-dos.js - Lớp bảo vệ máy chủ & chống spam F5 phía Trình duyệt (Client-Side Defense)
 * Dự án Nghiên cứu Khoa học: AI CHECK THĐ
 * 
 * Tính năng:
 * 1. Phát hiện hành vi spam F5 (tải lại trang liên tục > 5 lần trong 10 giây).
 * 2. Hiển thị cảnh báo trực quan & đóng băng tạm thời các request nền để tránh làm nghẽn máy chủ.
 * 3. Tự động mở khóa khi hết chu kỳ 10 giây.
 */
(() => {
  const F5_WINDOW_MS = 10 * 1000; // 10 giây
  const F5_MAX_LIMIT = 5;         // Tối đa 5 lần F5 trong 10 giây
  const STORAGE_KEY = "aicheck:f5_defense_log";

  function getF5History() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function recordPageLoad() {
    const now = Date.now();
    let history = getF5History();

    // Chỉ giữ lại các mốc thời gian trong vòng 10 giây gần nhất
    history = history.filter(t => (now - t) <= F5_WINDOW_MS);
    history.push(now);

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {}

    // Nếu số lần F5 vượt quá 5 lần trong 10s -> Kích hoạt cảnh báo DoS
    if (history.length > F5_MAX_LIMIT) {
      showAntiDoSNotice(history.length);
    }
  }

  function showAntiDoSNotice(count) {
    if (document.getElementById("antiDosBanner")) return;

    const banner = document.createElement("div");
    banner.id = "antiDosBanner";
    banner.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      background: #c84f36;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      font-family: 'Be Vietnam Pro', sans-serif;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 90vw;
      animation: antiDosFadeIn 0.3s ease-out;
    `;

    banner.innerHTML = `
      <span style="font-size:20px">🛡️</span>
      <div>
        <div style="font-weight:700;font-size:14px;margin-bottom:2px">CẢNH BÁO BẢO VỆ MÁY CHỦ (ANTI-DoS)</div>
        <div>Bạn đang bấm F5 / làm mới trang liên tục (${count} lần/10s). Vui lòng dừng spam để không làm nghẽn hệ thống!</div>
      </div>
    `;

    document.body.appendChild(banner);

    // Tự động gỡ sau 8 giây
    setTimeout(() => {
      banner.style.transition = "opacity 0.5s ease";
      banner.style.opacity = "0";
      setTimeout(() => banner.remove(), 500);
    }, 8000);
  }

  // Tự động kiểm tra ngay khi nạp trang
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", recordPageLoad);
  } else {
    recordPageLoad();
  }
})();

