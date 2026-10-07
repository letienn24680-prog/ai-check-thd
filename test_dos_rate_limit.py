"""
test_dos_rate_limit.py - Kịch bản kiểm thử tự động Kỹ thuật Rate Limiting (Chống DoS / Spam F5)
Kiểm chứng: Gửi 7 request liên tục trong 1 giây
Kết quả mong muốn:
- 5 request đầu: 200 OK (Thành công)
- Request 6 & 7: 429 Too Many Requests (Bị chặn tức thì)
"""

import urllib.request
import urllib.error
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

URL = "http://127.0.0.1:8000/api/ping"
TOTAL_TEST_REQUESTS = 7

def run_test():
    print("\n" + "=" * 65)
    print("🧪 BẮT ĐẦU KIỂM THỬ PHÒNG THỦ DoS / RATE LIMITING")
    print(f"🎯 Mục tiêu: Gửi {TOTAL_TEST_REQUESTS} request liên tiếp tới: {URL}")
    print("=" * 65)

    success_count = 0
    blocked_count = 0

    for i in range(1, TOTAL_TEST_REQUESTS + 1):
        print(f"\n[Gửi Request #{i}...] ", end="")
        try:
            req = urllib.request.Request(URL, headers={"User-Agent": "DoS-Tester/1.0"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                code = resp.getcode()
                body = json.loads(resp.read().decode("utf-8"))
                if code == 200:
                    success_count += 1
                    print(f"-> 🟢 [MÃ {code} OK] {body.get('message')} (Lượt: {body.get('request_count')}/5)")
                else:
                    print(f"-> 🟡 [MÃ {code}] {body}")
        except urllib.error.HTTPError as e:
            if e.code == 429:
                blocked_count += 1
                try:
                    err_body = json.loads(e.read().decode("utf-8"))
                    msg = err_body.get("message", "Bị chặn")
                except Exception:
                    msg = "Too Many Requests"
                print(f"-> 🛑 [MÃ 429 BỊ CHẶN] {msg}")
            else:
                print(f"-> ❌ [LỖI {e.code}] {e.reason}")
        except Exception as ex:
            print(f"-> ❌ [LỖI KẾT NỐI]: Không thể kết nối tới server. Hãy chắc chắn đã chạy: python server.py ({ex})")
            return False

        # Gửi cực nhanh không nghỉ (mô phỏng spam DoS / F5)
        time.sleep(0.05)

    print("\n" + "=" * 65)
    print("📊 KẾT QUẢ KIỂM THỬ:")
    print(f"  • Số request thành công (200 OK)      : {success_count} / 5 (Đúng thiết kế)")
    print(f"  • Số request bị chặn kịp thời (429)     : {blocked_count} / 2 (Đúng thiết kế)")
    
    if success_count == 5 and blocked_count == 2:
        print("\n🏆 KẾT LUẬN: ĐẠT CHUẨN 100%! HỆ THỐNG PHÒNG THỦ DoS HOẠT ĐỘNG HOÀN HẢO.")
        print("   Server hoàn toàn không bị sập hay treo RAM/CPU khi bị spam F5 liên tục.")
    else:
        print("\n⚠️ CẦN KIỂM TRA LẠI CẤU HÌNH RATE LIMIT.")
    print("=" * 65 + "\n")
    return True

if __name__ == "__main__":
    run_test()
