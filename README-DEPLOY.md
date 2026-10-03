# Đưa AI CHECK THĐ lên mạng và bật đồng bộ

## 1. Tạo cơ sở dữ liệu Supabase

1. Tạo một project tại Supabase và mở **SQL Editor**.
2. Chạy toàn bộ nội dung `supabase/schema.sql`.
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

## 4. Cập nhật kết quả nghiên cứu đã duyệt

Bảng `research_summary` chỉ cho phép đọc công khai; website không có quyền ghi bảng này. Sau khi giáo viên duyệt số liệu, cập nhật một dòng qua Supabase SQL Editor:

```sql
insert into public.research_summary (
  id, sample_size, ai_use_pct, verify_often_pct,
  before_mean, after_mean, good_rate_pct, updated_at
) values (
  1, 0, 0, 0, 0, 0, 0, now()
)
on conflict (id) do update set
  sample_size = excluded.sample_size,
  ai_use_pct = excluded.ai_use_pct,
  verify_often_pct = excluded.verify_often_pct,
  before_mean = excluded.before_mean,
  after_mean = excluded.after_mean,
  good_rate_pct = excluded.good_rate_pct,
  updated_at = now();
```

Thay các số 0 bằng số liệu tổng hợp đã được xác minh. Không nhập tên, lớp, email hoặc thông tin định danh học sinh.

## Lưu ý về BXH

Điểm mới được gửi lên Supabase để mọi người cùng xem; nếu Supabase chưa cấu hình hoặc mất kết nối, website vẫn lưu cục bộ. Kết quả cũ đang nằm trong trình duyệt **không tự chuyển** lên cơ sở dữ liệu. Bảng công khai dùng biệt danh và điểm cao nhất theo từng hoạt động. Vì trình duyệt gửi điểm, người dùng có thể giả mạo điểm; không dùng BXH này làm điểm chính thức. Muốn chống gian lận cần xác thực người dùng và xác minh/chấm điểm phía máy chủ.

Không nhập tên thật, lớp, email hay mã học sinh vào biệt danh. Bảng điểm có thể được mọi khách truy cập đọc.
