# Đưa AI CHECK THĐ lên mạng và bật đồng bộ

## 1. Tạo cơ sở dữ liệu Supabase

1. Tạo một project tại Supabase và mở **SQL Editor**.
2. Chạy toàn bộ nội dung `supabase/schema.sql`. Schema sẽ thêm bảng điểm vào publication `supabase_realtime` để BXH nhận thông báo khi có điểm mới.
3. Trong **Project Settings → API**, sao chép Project URL và publishable/anon key.
4. Điền hai giá trị vào `supabase-config.js`:

```js
window.AICHECK_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_PUBLISHABLE_OR_ANON_KEY",
  googleFormUrl: "",
  infographicUrl: "",
  videoUrl: ""
};
```

Publishable/anon key được phép nằm trong website khi RLS đã bật. Không bao giờ đưa `service_role` key, mật khẩu, hay access token vào file này.

## 2. Điền liên kết sản phẩm

Điền URL Google Form, infographic và video vào `supabase-config.js` trước khi xuất bản. Các URL nhập trực tiếp ở trang Tài nguyên chỉ lưu trên trình duyệt đang dùng, không tự chia sẻ cho các thiết bị khác.

## 3. Xuất bản bằng Netlify

1. Đưa toàn bộ thư mục dự án lên một GitHub repository. Không xóa cấu trúc `pages/` hoặc file `site.css`, `cloud.js`, `supabase-config.js`.
2. Trong Netlify, chọn **Add new site → Import an existing project** rồi kết nối repository.
3. Để build command trống; publish directory là `.`. Cấu hình này cũng đã có trong `netlify.toml`.
4. Chọn **Deploy**. Netlify sẽ cấp URL dạng `https://ten-site.netlify.app`.
5. Mở URL đó và thử các trang; không dùng URL `file:///` để kiểm tra đồng bộ vì trang cần được phục vụ qua HTTPS.

Khi sửa website sau này, cập nhật repository; Netlify sẽ tự deploy lại.

## 4. Kết quả nghiên cứu tự động

Sau khi thêm ID người tham gia và giai đoạn đo, chạy lại toàn bộ `supabase/schema.sql` trong SQL Editor. Schema sẽ thêm các cột còn thiếu và tạo view `research_assessment_summary` cho trang Nghiên cứu.

Trước mỗi bài đánh giá 15 câu, học sinh phải chọn **Trước can thiệp** hoặc **Sau can thiệp**. Trang Nghiên cứu đọc ID ẩn danh, lấy kết quả mới nhất của mỗi ID ở từng giai đoạn, rồi tự tính số người, số lượt, điểm trung bình và tỷ lệ đạt Khá/Giỏi. Trang tự tải lại dữ liệu định kỳ.

Để so sánh cùng một nhóm, học sinh cần làm cả hai lần trên cùng trình duyệt/thiết bị và không xóa dữ liệu trang. ID chỉ đại diện cho một trình duyệt, không xác minh danh tính thật: một người đổi máy có thể bị tính thành ID mới. Các bài nộp cũ chưa có giai đoạn `pre`/`post` không được dùng trong so sánh này. Số liệu sử dụng AI hoặc thường xuyên kiểm chứng từ Google Forms không được suy ra từ điểm đánh giá; cần tổng hợp riêng nếu đề tài muốn báo cáo các tỷ lệ đó.

Không nhập tên, lớp, email hoặc thông tin định danh học sinh. Bảng điểm công khai vẫn có thể bị giả mạo vì kết quả được gửi từ trình duyệt.

## Lưu ý về BXH & Họ và tên thí sinh

Điểm mới được gửi lên Supabase để mọi người cùng xem; BXH nhận thay đổi qua Supabase Realtime và tự tải lại mỗi 20 giây làm phương án dự phòng. Nếu đã chạy schema trước khi bật Realtime cho BXH, hãy chạy lại `supabase/schema.sql` trong SQL Editor. Nếu Realtime không kết nối được, trang sẽ báo trạng thái và tiếp tục tự làm mới định kỳ. Khi Supabase chưa cấu hình hoặc mất kết nối, website vẫn lưu cục bộ. Bảng xếp hạng hiển thị Họ và tên thí sinh và điểm số cao nhất theo từng hoạt động.

Họ và tên thí sinh được thiết lập khi đăng ký tài khoản hoặc cập nhật hồ sơ lần đầu. Sau khi đã nhập Họ và tên, hệ thống sẽ cố định vĩnh viễn và không thể thay đổi lại để đảm bảo tính minh bạch và chuẩn hóa dữ liệu báo cáo nghiên cứu.
