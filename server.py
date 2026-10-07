"""
server.py - Máy chủ cục bộ tích hợp Kỹ thuật Rate Limiting (Chống DoS / Spam F5)
Đề tài Nghiên cứu Khoa học - AI CHECK THĐ (THPT Trần Hưng Đạo)

Giải pháp bảo vệ máy chủ:
- Bước 1: In-Memory Map (RAM) lưu địa chỉ IP và số lần gửi request.
- Bước 2: Middleware kiểm tra thời gian 10 giây. Nếu quá 10s -> Reset về 1. Nếu trong 10s -> Tăng 1.
- Bước 3: Nếu vượt quá 5 request / 10 giây -> Chặn tức thì và trả về HTTP 429 (Too Many Requests).
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import time
import sys

# Đảm bảo mã hóa UTF-8 trên Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# -------------------------------------------------------------
# BƯỚC 1: TẠO BỘ NHỚ TRONG RAM (IN-MEMORY MAP) LƯU IP & SỐ LẦN TRUY CẬP
# Cấu trúc: ip_table[client_ip] = {"count": int, "start_time": float}
# -------------------------------------------------------------
ip_table = {}
WINDOW_SECONDS = 10   # Cửa sổ thời gian kiểm tra: 10 giây
MAX_REQUESTS = 5     # Ngưỡng tối đa cho phép: 5 requests / 10 giây
PORT = 8000

# -------------------------------------------------------------
# BƯỚC 2 & 3: HÀM RATE LIMIT CHẶN SPAM & TRẢ VỀ 429 NẾU VƯỢT QUÁ
# -------------------------------------------------------------
def check_rate_limit(client_ip: str):
    now = time.time()
    record = ip_table.get(client_ip)

    if not record or (now - record["start_time"] > WINDOW_SECONDS):
        # Hết chu kỳ 10s hoặc IP mới -> Khởi tạo lại chu kỳ
        ip_table[client_ip] = {"count": 1, "start_time": now}
        return True, 1, WINDOW_SECONDS

    # Vẫn trong chu kỳ 10 giây -> Tăng số đếm
    record["count"] += 1
    remaining_time = max(1, int(WINDOW_SECONDS - (now - record["start_time"])))

    # Kiểm tra vượt ngưỡng
    if record["count"] > MAX_REQUESTS:
        return False, record["count"], remaining_time

    return True, record["count"], remaining_time


class AntiDoSHandler(SimpleHTTPRequestHandler):
    """Handler tích hợp lớp phòng thủ Rate Limiting Middleware"""

    def do_GET(self):
        client_ip = self.client_address[0]

        # Kiểm tra qua Middleware Rate Limiting
        allowed, count, remaining_sec = check_rate_limit(client_ip)

        if not allowed:
            # 🛑 CHẶN LẬP TỨC: Trả về HTTP 429 Too Many Requests
            self.send_response(429)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Retry-After", str(remaining_sec))
            self.send_header("X-RateLimit-Limit", str(MAX_REQUESTS))
            self.send_header("X-RateLimit-Remaining", "0")
            self.end_headers()

            payload = {
                "status": 429,
                "error": "Too Many Requests",
                "message": f"PHÒNG THỦ DoS: Bạn đã gửi {count}/{MAX_REQUESTS} request trong 10s! Vui lòng chờ {remaining_sec} giây trước khi gửi lại.",
                "retry_after_seconds": remaining_sec,
                "client_ip": client_ip
            }
            self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
            print(f"[🛡️ CHẶN 429] IP {client_ip} bị chặn! Đã gửi {count}/{MAX_REQUESTS} req trong 10s (Chờ {remaining_sec}s).")
            return

        # Đính kèm headers thông tin lượt còn lại
        remain = max(0, MAX_REQUESTS - count)
        print(f"[✅ HỢP LỆ 200] IP {client_ip} -> Request #{count}/{MAX_REQUESTS} (Còn lại: {remain})")

        # Endpoint API kiểm tra sức khỏe hệ thống
        if self.path == "/api/ping" or self.path == "/api/check":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("X-RateLimit-Limit", str(MAX_REQUESTS))
            self.send_header("X-RateLimit-Remaining", str(remain))
            self.end_headers()
            payload = {
                "status": 200,
                "message": "OK - Kết nối máy chủ thành công!",
                "request_count": count,
                "limit": MAX_REQUESTS,
                "remaining": remain,
                "client_ip": client_ip
            }
            self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
            return

        # Phục vụ các file tĩnh HTML/CSS/JS của dự án bình thường
        return super().do_GET()


if __name__ == "__main__":
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, AntiDoSHandler)
    print("=" * 65)
    print(f"🚀 MÁY CHỦ AI CHECK THĐ ĐÃ KHỞI ĐỘNG TẠI: http://localhost:{PORT}")
    print(f"🛡️ CƠ CHẾ BẢO VỆ DoS: Tối đa {MAX_REQUESTS} requests trong {WINDOW_SECONDS} giây / IP")
    print("=" * 65)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng máy chủ an toàn.")
        sys.exit(0)
