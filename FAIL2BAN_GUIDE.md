# 🛡️ CẨM NANG BẢO VỆ MÁY CHỦ VPS & QUẢN TRỊ BLOCK / UNBAN IP VỚI FAIL2BAN

> **Tài liệu Kỹ thuật & Quản trị Hệ thống**  
> Dự án: Hệ thống Nghiên cứu Khoa học & Nền tảng Giáo dục Trực tuyến  
> Áp dụng cho: Linux Ubuntu / Debian / CentOS (VPS, Cloud Server)

---

## 1. Đặt vấn đề: Tại sao VPS cần Fail2ban?
Khi triển khai website, API hoặc cơ sở dữ liệu lên một máy chủ VPS có địa chỉ IP công khai (Public IP):
- **Botnet quét cổng 24/7**: Các công cụ dò quét tự động (Brute-Force Bots) liên tục thử hàng nghìn tài khoản/mật khẩu mặc định (`root`, `admin`, `ubuntu`,...) nhằm chiếm quyền kiểm soát máy chủ qua cổng SSH (22) hoặc web admin.
- **Tốn tài nguyên & nguy cơ sập**: Việc xử lý hàng ngàn kết nối SSH rác liên tục khiến CPU tăng vọt, tràn băng thông và có nguy cơ bị lộ mật khẩu nếu người quản trị đặt mật khẩu chưa đủ mạnh.
- **Không thể chặn thủ công**: Không một người quản trị nào có thể ngồi canh log cả ngày để gõ lệnh `iptables` hoặc `ufw` chặn từng IP một cách thủ công.

👉 **Giải pháp tối ưu**: Sử dụng **Fail2ban** – công cụ tự động quét log, phát hiện hành vi tấn công và tự động ra lệnh cho Tường lửa (Firewall) khóa vĩnh viễn hoặc tạm thời địa chỉ IP của kẻ tấn công.

---

## 2. Nguyên lý hoạt động của Fail2ban

```
 [ Hacker / Botnet ] 
        │
        ▼ (Thử đăng nhập sai liên tục)
 ┌────────────────────────────────────────────────────────┐
 │ 1. Dịch vụ Hệ thống (SSH / Nginx / Nền tảng)          │
 │    • Ghi nhận lần thử thất bại vào file log:           │
 │      /var/log/auth.log hoặc /var/log/nginx/error.log   │
 └────────────────────────────────────────────────────────┘
        │
        ▼ (Theo dõi log theo thời gian thực)
 ┌────────────────────────────────────────────────────────┐
 │ 2. Fail2ban Engine (Bộ đếm & Nhận diện)                │
 │    • Đếm số lần sai của từng IP trong khoảng findtime  │
 │    • Nếu số lần sai >= maxretry (Ví dụ: 5 lần)         │
 └────────────────────────────────────────────────────────┘
        │
        ▼ (Kích hoạt hình phạt tự động)
 ┌────────────────────────────────────────────────────────┐
 │ 3. Tường lửa Linux (UFW / Iptables / Nftables)        │
 │    • Thêm luật DROP / REJECT địa chỉ IP vi phạm        │
 │    • IP bị chặn hoàn toàn trong khoảng bantime         │
 │    • Hết thời gian phạt -> Tự động mở khóa (Unban)     │
 └────────────────────────────────────────────────────────┘
```

### Các thông số cốt lõi trong cấu hình (`jail.local`):
- `maxretry`: Số lần đăng nhập sai tối đa cho phép trước khi bị khóa (Mặc định: 3 - 5 lần).
- `findtime`: Khoảng thời gian theo dõi các lần thử sai (Ví dụ: 10 phút / 600 giây).
- `bantime`: Thời gian phạt chặn IP (Ví dụ: 10 phút, 1 giờ, 1 ngày, hoặc `-1` để cấm vĩnh viễn).
- `ignoreip`: Danh sách địa chỉ IP được miễn trừ (Luôn thêm IP mạng nhà/cơ quan của bạn và `127.0.0.1` để tránh tự khóa chính mình).

---

## 3. Hướng dẫn Cài đặt & Cấu hình từng bước

### Bước 1: Cài đặt Fail2ban
Trên hệ điều hành Ubuntu / Debian:
```bash
sudo apt update && sudo apt install fail2ban -y
```

Khởi động và kích hoạt Fail2ban chạy cùng hệ thống:
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

### Bước 2: Tạo tệp cấu hình an toàn `jail.local`
*Lưu ý: Không chỉnh sửa trực tiếp file `jail.conf` vì sẽ bị ghi đè khi cập nhật gói.*

```bash
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Thêm/chỉnh sửa nội dung cấu hình chuẩn bảo vệ SSH:
```ini
[DEFAULT]
# Danh sách IP không bao giờ bị khóa (Thay 1.2.3.4 bằng IP của bạn)
ignoreip = 127.0.0.1/8 ::1 1.2.3.4

# Thời gian chặn mặc định: 1 giờ (3600 giây)
bantime = 3600

# Khoảng thời gian đếm lỗi: 10 phút (600 giây)
findtime = 600

# Số lần thử sai tối đa trước khi bị khóa: 5 lần
maxretry = 5

# Tường lửa sử dụng: UFW hoặc iptables
banaction = ufw

# --- CẤU HÌNH BẢO VỆ DỊCH VỤ SSH ---
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 86400  # Chặn 24 giờ đối với IP dò quét SSH
```

Lưu file (`Ctrl + O`, Enter, `Ctrl + X`) rồi khởi động lại dịch vụ:
```bash
sudo systemctl restart fail2ban
```

---

## 4. Bảng tra cứu Lệnh Quản trị Nhanh (Cheat Sheet)

### A. Kiểm tra trạng thái & Danh sách IP đang bị khóa
| Mục đích | Câu lệnh |
| :--- | :--- |
| **Xem trạng thái tổng quan** | `sudo fail2ban-client status` |
| **Xem danh sách IP bị khóa (SSH)** | `sudo fail2ban-client status sshd` |
| **Xem log chặn IP theo thời gian thực** | `sudo tail -f /var/log/fail2ban.log` |
| **Kiểm tra trạng thái dịch vụ** | `sudo systemctl status fail2ban` |

---

### B. Hướng dẫn Mở khóa (Unban IP) dành cho Admin

Trường hợp bạn hoặc người dùng hợp lệ bị khóa do gõ nhầm mật khẩu quá nhiều lần:

#### 1. Mở khóa cho 1 IP trên dịch vụ cụ thể (Ví dụ SSH):
```bash
sudo fail2ban-client set sshd unbanip <ĐỊA_CHỈ_IP>
```
*Ví dụ:*
```bash
sudo fail2ban-client set sshd unbanip 203.0.113.45
```

#### 2. Mở khóa cho 1 IP trên TẤT CẢ các dịch vụ (All Jails):
```bash
sudo fail2ban-client unban <ĐỊA_CHỈ_IP>
```
*Ví dụ:*
```bash
sudo fail2ban-client unban 203.0.113.45
```

#### 3. Gỡ chặn TOÀN BỘ danh sách IP đang bị khóa trên hệ thống:
```bash
sudo fail2ban-client unban --all
```

---

### C. Khóa thủ công 1 IP đáng ngờ (Manual Ban)
Nếu phát hiện một IP khả nghi trong access log, bạn có thể chủ động khóa ngay lập tức:
```bash
sudo fail2ban-client set sshd banip <ĐỊA_CHỈ_IP>
```

---

## 5. Nguyên tắc Vàng khi Quản trị VPS
1. **Luôn cấu hình `ignoreip`**: Trước khi bật Fail2ban, hãy kiểm tra IP máy tính của bạn tại `canhazip.com` hoặc `whatismyip.com` và thêm vào `ignoreip`.
2. **Sử dụng SSH Key**: Vô hiệu hóa tính năng đăng nhập SSH bằng mật khẩu thường (`PasswordAuthentication no`) trong `/etc/ssh/sshd_config`, chuyển sang dùng SSH Key. Khi đó, hacker dò mật khẩu sẽ hoàn toàn vô dụng.
3. **Đổi cổng SSH mặc định**: Chuyển cổng SSH từ mặc định `22` sang một cổng ngẫu nhiên (ví dụ `2222` hoặc `54321`) để loại bỏ 95% bot tự động quét cổng thông thường.
4. **Kết hợp Tường lửa UFW**: Luôn bật `sudo ufw enable` và chỉ mở các cổng dịch vụ thực sự cần thiết (`80`, `443`, `SSH port`).

