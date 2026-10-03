# Kết nối Google Forms với thống kê trên website

Website đọc một bản tổng hợp chỉ gồm số lượng phản hồi và phân bố lựa chọn từ
Google Apps Script. Website không tải các dòng trả lời của học sinh. Endpoint
loại các cột dấu thời gian, tên, email, số điện thoại, lý do, ý kiến và câu trả
lời tự do; nội dung người trả lời tự nhập ở lựa chọn “Khác” cũng được ẩn.

## 1. Kiểm tra Google Form và Google Sheets

1. Mở Google Form và vào thẻ **Câu trả lời**.
2. Nhấn biểu tượng Google Sheets màu xanh để mở bảng tính nhận câu trả lời.
   Nếu Form chưa liên kết Sheets, chọn **Tạo bảng tính mới**.
3. Trong Sheets, xác nhận có một tab chứa câu trả lời Form. Không cần cấp quyền
   công khai cho bảng tính.
4. Sao chép ID bảng tính từ URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   Chỉ sao chép phần giữa `/d/` và `/edit`. ID không phải mật khẩu; không đăng
   công khai trang tính hoặc dữ liệu phản hồi.

## 2. Tạo Apps Script

1. Tại chính bảng tính câu trả lời, chọn **Tiện ích mở rộng → Apps Script**
   (Extensions → Apps Script).
2. Mở tệp `Code.gs` trong dự án website này, sao chép toàn bộ nội dung và thay
   nội dung `Code.gs` trong trình soạn thảo Apps Script bằng mã đó.
3. Ở đầu mã, thay `PASTE_SPREADSHEET_ID_HERE` bằng ID bảng tính vừa sao chép:

   ```js
   const SPREADSHEET_ID = "ID_BANG_TINH_CUA_BAN";
   ```

4. Để `RESPONSE_SHEET_NAME` là chuỗi rỗng nếu tên tab là `Form Responses 1`
   hoặc `Câu trả lời biểu mẫu 1`. Nếu tab có tên khác, điền chính xác tên tab,
   ví dụ:

   ```js
   const RESPONSE_SHEET_NAME = "Biểu mẫu 1";
   ```

5. Nhấn **Lưu dự án**. Chọn hàm `getSummary` trong danh sách hàm, nhấn **Run**
   (Chạy), rồi cấp quyền đọc bảng tính cho chính tài khoản sở hữu Form. Hàm
   `getSummary` chỉ đọc và tổng hợp, không sửa dữ liệu.

## 3. Triển khai Web App

1. Trong Apps Script, nhấn **Deploy → New deployment**.
2. Nhấn biểu tượng bánh răng **Select type → Web app**.
3. Chọn **Execute as: Me** (thực thi bằng tài khoản của bạn).
4. Chọn **Who has access: Anyone** (bất kỳ ai) để website công khai có thể đọc
   thống kê. Chỉ làm bước này với mã Apps Script đã kiểm tra. Mã mẫu chỉ trả
   số tổng hợp, không trả tên, thời gian hoặc câu trả lời từng dòng.
5. Nhấn **Deploy** và hoàn tất bước cấp quyền nếu Google yêu cầu.
6. Sao chép **Web app URL**, thường có dạng
   `https://script.google.com/macros/s/.../exec`.

Không chọn **Anyone with Google account** nếu người xem website cần xem thống kê
mà không đăng nhập; tuỳ chọn đó có thể khiến website không tải được dữ liệu.
Không dùng **Publish to web** để công khai toàn bộ Google Sheet.

## 4. Kết nối website

1. Mở `forms-summary-config.js` trong thư mục gốc website.
2. Thay URL rỗng bằng URL Web App vừa sao chép, giữ nguyên dấu ngoặc kép:

   ```js
   window.AICheckFormSummaryUrl = "https://script.google.com/macros/s/ID_DEPLOYMENT/exec";
   ```

3. Lưu thay đổi và tải/cập nhật toàn bộ website lên hosting.
4. Mở trang **Nghiên cứu** trên hosting, tải lại trang. Khi kết nối thành công,
   trạng thái sẽ báo đã tải thống kê, hiển thị tổng phản hồi và các biểu đồ lựa
   chọn. Website hỏi Apps Script lại mỗi 30 giây.

Không thể kiểm tra endpoint bằng cách mở riêng URL `/exec` trên trình duyệt;
endpoint cần tham số callback do website thêm vào. Hãy kiểm tra trạng thái ngay
trong phần thống kê trên trang Nghiên cứu.

## 5. Khi thêm phản hồi hoặc chỉnh sửa mã

- Phản hồi mới thường xuất hiện sau lần làm mới tiếp theo, tối đa khoảng 30
  giây, ngoài thời gian Google cập nhật Sheet.
- Nếu chỉnh sửa Apps Script sau khi đã triển khai: vào **Deploy → Manage
  deployments → Edit**, chọn **New version**, rồi nhấn **Deploy**. URL Web App
  hiện tại thường vẫn giữ nguyên.
- Nếu đổi quyền truy cập, tên tab hoặc tài khoản, kiểm tra lại URL triển khai
  và quyền đọc bảng tính.

## Riêng tư và giới hạn

- Không công khai hoặc gửi cho người khác quyền truy cập Google Sheet phản hồi.
- Cột nhận dạng bị bỏ qua dựa theo tiêu đề. Hãy kiểm tra `EXCLUDED_HEADER_PATTERN`
  trong `Code.gs` và bổ sung tên cột cá nhân hoặc câu trả lời mở nếu Form thay đổi.
- Câu trả lời dài và câu trả lời tự nhập sau “Khác” không được trả về. Câu chọn
  nhiều được tính theo từng lựa chọn; vì vậy phần trăm của câu đó có thể cộng
  vượt 100%.
- Thống kê công khai khi endpoint được triển khai cho **Anyone**. Không thu thập
  hoặc thêm trường nhận dạng cá nhân vào JSON trả về.
