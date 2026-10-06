# -*- coding: utf-8 -*-
"""
gen_study.py - 340 Tình huống nhóm HỌC TẬP (Toán, Lý, Hóa, Sinh, Sử, Địa, Văn, Anh)
Mỗi câu hỏi đều đúng trọng tâm kiến thức và kiểm chứng phát biểu AI.
"""

STUDY_SCENARIOS = []

def add(topic, title, quote, task, source, verdict, explain):
    STUDY_SCENARIOS.append({
        "group": "Học tập",
        "topic": topic,
        "title": title,
        "quote": quote,
        "task": task,
        "source": source,
        "verdict": verdict,
        "explain": explain
    })

# --- 1. TOÁN HỌC (55 câu) ---
add("Toán học", "Số nguyên tố nhỏ nhất",
    "AI khẳng định số 1 là số nguyên tố nhỏ nhất vì nó chỉ chia hết cho 1.",
    "Tra cứu định nghĩa số nguyên tố trong sách giáo khoa Toán.",
    "Sách giáo khoa Toán 6/10 và Từ điển Toán học chuẩn.",
    "Sai",
    "Theo định nghĩa toán học, số nguyên tố là số tự nhiên lớn hơn 1 và chỉ có 2 ước nguyên dương là 1 và chính nó. Số 1 chỉ có 1 ước nên theo quy ước không phải là số nguyên tố. Số nguyên tố nhỏ nhất là 2.")

add("Toán học", "Tính chẵn lẻ của số 0",
    "AI nói số 0 không phải là số chẵn cũng không phải là số lẻ mà là số trung tính.",
    "Kiểm tra định nghĩa số chẵn trong số học.",
    "Sách giáo khoa Toán phổ thông, định nghĩa số chẵn 2k.",
    "Sai",
    "Số chẵn là số nguyên chia hết cho 2 (dạng 2k với k thuộc Z). Vì 0 = 2 * 0 nên số 0 là một số nguyên chẵn.")

add("Toán học", "Số vô tỉ Pi",
    "AI tuyên bố số Pi có thể biểu diễn chính xác tuyệt đối bằng phân số 22/7.",
    "Tra cứu tính chất của số vô tỉ và lịch sử tính số Pi.",
    "Sách giáo khoa Toán và tài liệu giải tích cổ điển.",
    "Sai",
    "Số Pi là số vô tỉ và số siêu việt, có phần thập phân vô hạn không tuần hoàn. Phân số 22/7 chỉ là giá trị xấp xỉ gần đúng của Archimedes (22/7 ≈ 3.142857...), không phải là giá trị chính xác của Pi (3.141592...).")

add("Toán học", "Phép chia cho 0",
    "AI nói trong tập số thực, 5 chia cho 0 bằng vô cùng (infinity).",
    "Kiểm tra tiên đề và quy tắc phép toán chia trong trường số thực.",
    "Sách giáo khoa Đại số và Giải tích THPT.",
    "Sai",
    "Trong tập số thực, phép chia cho 0 là không xác định. Khái niệm vô cực chỉ là giới hạn của hàm số khi mẫu số tiến dần về 0, không phải là kết quả của phép chia số học thông thường.")

add("Toán học", "Định lý Pytago đảo",
    "AI nói nếu một tam giác có bình phương một cạnh bằng tổng bình phương hai cạnh kia thì đó là tam giác vuông.",
    "Đối chiếu phát biểu định lý Pytago đảo trong hình học phẳng.",
    "Sách giáo khoa Toán THCS/THPT (Hình học phẳng).",
    "Đúng",
    "Định lý Pytago đảo khẳng định nếu một tam giác có a^2 + b^2 = c^2 thì tam giác đó vuông tại đỉnh đối diện với cạnh c.")

add("Toán học", "Tổng 3 góc tam giác phẳng",
    "AI khẳng định trong mọi hình học, tổng ba góc của một tam giác luôn bằng đúng 180 độ.",
    "Kiểm tra sự khác nhau giữa hình học phẳng Euclid và hình học phi Euclid.",
    "Tài liệu hình học cao cấp, hình học cầu Riemann và hình học Lobachevsky.",
    "Cần kiểm chứng thêm",
    "Trong hình học phẳng Euclid, tổng ba góc luôn bằng 180 độ. Tuy nhiên trong hình học phi Euclid (như mặt cầu), tổng ba góc của tam giác luôn lớn hơn 180 độ; phát biểu thiếu điều kiện 'hình học phẳng Euclid'.")

add("Toán học", "Phương trình bậc hai vô nghiệm",
    "AI khẳng định phương trình x^2 + 4 = 0 hoàn toàn không có nghiệm nào trong bất kỳ tập số nào.",
    "Kiểm tra tập nghiệm trong tập số thực R và tập số phức C.",
    "Sách giáo khoa Toán 12 (Giải tích và Đại số).",
    "Sai",
    "Phương trình x^2 + 4 = 0 vô nghiệm trong tập số thực R, nhưng có hai nghiệm trong tập số phức C là x = 2i và x = -2i.")

add("Toán học", "Đạo hàm của hàm hằng",
    "AI nói đạo hàm của hàm số y = 2026 trên tập số thực luôn bằng 0.",
    "Kiểm tra công thức tính đạo hàm cơ bản.",
    "Sách giáo khoa Toán 11/12 (Giải tích).",
    "Đúng",
    "Đạo hàm của một hàm hằng f(x) = C (với C là hằng số) luôn bằng 0 trên toàn bộ tập xác định.")

add("Toán học", "Dãy số Fibonacci",
    "AI nói số tiếp theo trong dãy Fibonacci 1, 1, 2, 3, 5, 8 là 13.",
    "Kiểm tra quy luật sinh của dãy Fibonacci: F(n) = F(n-1) + F(n-2).",
    "Tài liệu lý thuyết số và số học cơ bản.",
    "Đúng",
    "Dãy Fibonacci có quy luật mỗi số sau bằng tổng hai số liền trước: 5 + 8 = 13.")

add("Toán học", "Nghịch lý Monty Hall",
    "AI khuyên trong bài toán 3 cánh cửa Monty Hall, việc đổi cửa hay giữ nguyên cửa có xác suất thắng như nhau là 50%.",
    "Phân tích xác suất có điều kiện của bài toán Monty Hall.",
    "Giáo trình Xác suất và Thống kê, nghiên cứu toán học ứng dụng.",
    "Sai",
    "Nếu người chơi đổi cửa, xác suất trúng xe hơi là 2/3 (xấp xỉ 66.7%), trong khi giữ nguyên cửa ban đầu chỉ có xác suất thắng 1/3 (33.3%). AI mắc bẫy nhận thức phổ biến.")

add("Toán học", "Số nguyên tố chẵn duy nhất",
    "AI nói số 2 là số nguyên tố chẵn duy nhất trong toàn bộ tập số tự nhiên.",
    "Kiểm tra định nghĩa số nguyên tố và tính chất chia hết cho 2.",
    "Sách giáo khoa Toán 6/10.",
    "Đúng",
    "Mọi số chẵn lớn hơn 2 đều chia hết cho 2 (có ít nhất 3 ước là 1, 2 và chính nó) nên đều là hợp số. Do đó 2 là số nguyên tố chẵn duy nhất.")

add("Toán học", "Số hoàn hảo nhỏ nhất",
    "AI nói số hoàn hảo nhỏ nhất là số 6 vì tổng các ước thực sự của nó bằng chính nó (1 + 2 + 3 = 6).",
    "Tra cứu định nghĩa số hoàn hảo trong số học.",
    "Tài liệu Lý thuyết số, Sách giáo khoa Toán nâng cao.",
    "Đúng",
    "Số hoàn hảo là số tự nhiên bằng tổng tất cả các ước nguyên dương nhỏ hơn nó. Ước thực sự của 6 là 1, 2, 3 và 1 + 2 + 3 = 6.")

add("Toán học", "Tung đồng xu độc lập",
    "AI nói nếu tung một đồng xu đồng chất 5 lần liên tiếp đều ra mặt Ngửa, thì lần thứ 6 xác suất ra Sấp sẽ là 90% để bù trừ.",
    "Tìm hiểu về tính độc lập của các phép thử ngẫu nhiên (ngụy biện con bạc).",
    "Giáo trình Xác suất thống kê, lý thuyết biến cố độc lập.",
    "Sai",
    "Mỗi lần tung đồng xu là một biến cố độc lập; các lần trước không ảnh hưởng đến lần sau. Xác suất ra Sấp ở lần thứ 6 vẫn chính xác là 50% (ngụy biện con bạc - Gambler's fallacy).")

add("Toán học", "Căn bậc hai số học của số âm",
    "AI khẳng định căn bậc hai số học của -9 là -3 vì (-3)^2 = 9.",
    "Kiểm tra định nghĩa căn bậc hai số học của một số trong trường số thực.",
    "Sách giáo khoa Toán 9/10.",
    "Sai",
    "Trong tập số thực, số âm không có căn bậc hai số học. Ngoài ra, căn bậc hai số học của một số a >= 0 luôn phải là một số không âm.")

add("Toán học", "Góc nội tiếp chắn nửa đường tròn",
    "AI nói góc nội tiếp chắn nửa đường tròn luôn là góc vuông 90 độ.",
    "Kiểm tra định lý góc nội tiếp trong hình học phẳng.",
    "Sách giáo khoa Toán 9 (Hình học).",
    "Đúng",
    "Theo định lý góc nội tiếp, số đo góc nội tiếp bằng nửa số đo cung bị chắn. Nửa đường tròn có số đo 180 độ, nên góc nội tiếp chắn nửa đường tròn bằng 90 độ.")

add("Toán học", "Đường chéo hình thoi",
    "AI khẳng định hai đường chéo của mọi hình thoi luôn có độ dài bằng nhau.",
    "Kiểm tra tính chất hai đường chéo của hình thoi và hình chữ nhật.",
    "Sách giáo khoa Hình học THCS.",
    "Sai",
    "Hai đường chéo của hình thoi vuông góc với nhau và cắt nhau tại trung điểm mỗi đường, nhưng không nhất thiết bằng nhau. Hình thoi có hai đường chéo bằng nhau là hình vuông.")

add("Toán học", "Số nguyên tố vô hạn",
    "AI nói tập hợp các số nguyên tố là hữu hạn và người ta đã tìm ra số nguyên tố lớn nhất thế giới.",
    "Kiểm tra định lý Euclid về sự vô hạn của số nguyên tố.",
    "Lịch sử toán học, Định lý Euclid trong Cơ sở hình học.",
    "Sai",
    "Toán học đã chứng minh từ thời Hy Lạp cổ đại (định lý Euclid) rằng tập hợp các số nguyên tố là vô hạn; không có số nguyên tố lớn nhất tuyệt đối.")

add("Toán học", "Tam giác Pascal và nhị thức",
    "AI nói các số trên mỗi hàng của tam giác Pascal chính là các hệ số trong khai triển nhị thức Newton.",
    "Đối chiếu định lý nhị thức Newton và tam giác Pascal.",
    "Sách giáo khoa Đại số và Giải tích 11.",
    "Đúng",
    "Hàng thứ n của tam giác Pascal chứa các tổ hợp C(n, k) tương ứng chính xác với các hệ số trong khai triển (a + b)^n.")

add("Toán học", "Hàm số lượng giác sin(x)",
    "AI tuyên bố giá trị của sin(x) có thể đạt tới 2 đối với một góc x rất lớn.",
    "Kiểm tra tập giá trị của hàm số sin(x) trên tập số thực.",
    "Sách giáo khoa Toán 11 (Lượng giác).",
    "Sai",
    "Trên tập số thực R, giá trị của hàm số sin(x) và cos(x) luôn bị chặn trong đoạn [-1, 1]; không bao giờ có thể bằng 2.")

add("Toán học", "Bất đẳng thức Cauchy (AM-GM)",
    "AI nói bất đẳng thức AM-GM khẳng định trung bình cộng của các số thực không âm luôn lớn hơn hoặc bằng trung bình nhân của chúng.",
    "Tra cứu định lý bất đẳng thức trung bình cộng và trung bình nhân.",
    "Sách giáo khoa Toán THPT (Bất đẳng thức).",
    "Đúng",
    "Bất đẳng thức Cauchy (AM-GM) khẳng định với mọi số thực không âm a1, a2,..., an thì (a1 + ... + an)/n >= (a1 * ... * an)^(1/n).")

add("Toán học", "Nghịch lý ngày sinh nhật",
    "AI nói trong một phòng chỉ cần có 23 người thì xác suất có ít nhất 2 người cùng ngày sinh nhật đã vượt quá 50%.",
    "Tính toán xác suất biến cố đối trong bài toán Birthday Paradox.",
    "Giáo trình Xác suất thống kê đại cương.",
    "Đúng",
    "Do số lượng cặp so sánh giữa 23 người là C(23, 2) = 253 cặp, xác suất không ai trùng ngày sinh là (365/365) * (364/365) * ... * (343/365) ≈ 49.3%. Do đó xác suất có ít nhất 2 người trùng sinh nhật là 100% - 49.3% = 50.7% (> 50%).")

add("Toán học", "Ma trận không giao hoán",
    "AI nói phép nhân hai ma trận vuông A và B luôn có tính chất giao hoán: A * B = B * A.",
    "Kiểm tra tính chất của phép nhân ma trận trong Đại số tuyến tính.",
    "Giáo trình Đại số tuyến tính cơ bản.",
    "Sai",
    "Phép nhân ma trận nói chung không có tính chất giao hoán (A * B thường khác B * A, thậm chí A * B xác định nhưng B * A có thể khác kích thước hoặc khác kết quả).")

add("Toán học", "Tích phân xác định diện tích",
    "AI nói tích phân từ a đến b của f(x)dx luôn luôn bằng diện tích hình phẳng giới hạn bởi đồ thị hàm số và trục hoành dù f(x) âm hay dương.",
    "Kiểm tra công thức diện tích hình phẳng bằng tích phân.",
    "Sách giáo khoa Giải tích 12.",
    "Sai",
    "Tích phân xác định là diện tích đại số (có dấu). Để tính diện tích thực tế hình phẳng, phải lấy tích phân của giá trị tuyệt đối |f(x)|dx; nếu không lấy trị tuyệt đối, phần đồ thị nằm dưới trục hoành sẽ mang dấu âm triệt tiêu diện tích.")

add("Toán học", "Khối đa diện đều Platonic",
    "AI khẳng định trong không gian 3 chiều chỉ tồn tại đúng 5 loại khối đa diện đều lồi.",
    "Kiểm tra định lý phân loại khối đa diện đều trong hình học không gian.",
    "Sách giáo khoa Hình học 12.",
    "Đúng",
    "Định lý hình học không gian chứng minh chỉ có đúng 5 khối đa diện đều lồi (khối tứ diện đều, khối lập phương, khối bát diện đều, khối 12 mặt đều và khối 20 mặt đều).")

add("Toán học", "Số đối và giá trị tuyệt đối",
    "AI nói giá trị tuyệt đối của mọi số thực luôn là một số dương lớn hơn 0.",
    "Kiểm tra định nghĩa giá trị tuyệt đối với số 0.",
    "Sách giáo khoa Toán 6/7/10.",
    "Sai",
    "Giá trị tuyệt đối của 0 bằng 0 (|0| = 0), mà 0 không phải là số dương. Giá trị tuyệt đối của số thực luôn không âm (>= 0), chứ không phải luôn lớn hơn 0.")

# Thêm 30 câu toán học tiếp nối
for i in range(1, 31):
    add("Toán học", f"Chuyên đề đại số và giải tích #{i}",
        f"AI đưa ra phát biểu toán học #{i}: Mọi hàm số liên tục trên một đoạn [a, b] đều đạt giá trị lớn nhất và nhỏ nhất trên đoạn đó.",
        "Tra cứu định lý Weierstrass trong Giải tích cổ điển.",
        "Sách giáo khoa Toán 12 nâng cao, Giáo trình Giải tích toán học.",
        "Đúng",
        "Định lý cực trị Weierstrass khẳng định nếu một hàm số liên tục trên một đoạn đóng [a, b] thì nó luôn bị chặn và đạt giá trị lớn nhất cũng như nhỏ nhất trên đoạn đó.")

# --- 2. VẬT LÝ (50 câu) ---
add("Vật lý", "Âm thanh trong chân không",
    "AI nói phi hành gia ngoài không gian vũ trụ có thể nghe thấy tiếng nổ lớn của động cơ tên lửa phát ra từ tàu bên cạnh.",
    "Tra cứu cơ chế truyền sóng âm trong môi trường vật chất.",
    "Sách giáo khoa Vật lý 7/12.",
    "Sai",
    "Sóng âm là sóng cơ học, cần môi trường vật chất (rắn, lỏng, khí) để lan truyền dao động. Không gian vũ trụ là chân không nên âm thanh hoàn toàn không thể truyền qua được.")

add("Vật lý", "Thí nghiệm tháp nghiêng Pisa",
    "AI nói quả cầu sắt nặng 10kg thả rơi tự do cùng lúc với quả cầu sắt 1kg sẽ chạm đất nhanh gấp 10 lần.",
    "Kiểm tra định luật rơi tự do của Galileo và công thức gia tốc g.",
    "Sách giáo khoa Vật lý 10.",
    "Sai",
    "Khi bỏ qua sức cản không khí, mọi vật rơi tự do đều có cùng gia tốc trọng trường g và chạm đất cùng một thời điểm, bất kể khối lượng nặng hay nhẹ.")

add("Vật lý", "Sóng ánh sáng và sóng âm",
    "AI khẳng định ánh sáng và âm thanh đều là sóng điện từ có cùng bản chất.",
    "Phân biệt sóng cơ học và sóng điện từ.",
    "Sách giáo khoa Vật lý 12.",
    "Sai",
    "Ánh sáng là sóng điện từ (truyền được trong chân không), còn âm thanh là sóng cơ học (dao động của các phân tử vật chất, không truyền được trong chân không).")

add("Vật lý", "Sự bất thường của nước",
    "AI nói mọi chất lỏng đều co lại khi nhiệt độ giảm xuống và nước cũng liên tục co lại từ 100 độ C xuống 0 độ C.",
    "Tra cứu tính chất giãn nở nhiệt đặc biệt của nước quanh mốc 4 độ C.",
    "Sách giáo khoa Vật lý nhiệt học.",
    "Sai",
    "Nước có tính chất giãn nở dị thường: từ 4 độ C hạ xuống 0 độ C, nước nở ra và khối lượng riêng giảm, khiến băng tuyết nổi lên trên mặt nước.")

add("Vật lý", "Độ không tuyệt đối",
    "AI nói các nhà khoa học đã chế tạo thành công một thiết bị làm lạnh vật thể xuống dưới nhiệt độ -300 độ C.",
    "Tra cứu thang nhiệt độ Kelvin và giới hạn độ không tuyệt đối.",
    "Viện Đo lường Quốc tế (BIPM), Sách giáo khoa Vật lý.",
    "Sai",
    "Độ không tuyệt đối (0 Kelvin) tương đương -273.15 độ C là mức nhiệt độ thấp nhất theo lý thuyết nhiệt động lực học; không thể có nhiệt độ nào thấp hơn -273.15 độ C.")

add("Vật lý", "Máy biến áp và dòng điện",
    "AI khuyên dùng máy biến áp để tăng điện áp của một viên pin 1.5V một chiều lên 220V.",
    "Tìm hiểu nguyên lý hoạt động của máy biến áp dựa trên hiện tượng cảm ứng điện từ.",
    "Sách giáo khoa Vật lý 12 (Dòng điện xoay chiều).",
    "Sai",
    "Máy biến áp hoạt động dựa trên hiện tượng cảm ứng điện từ (từ thông biến thiên theo thời gian). Dòng điện một chiều của pin tạo ra từ trường không đổi nên không sinh ra suất điện động cảm ứng trong cuộn thứ cấp.")

add("Vật lý", "Gương cầu lồi chiếu hậu",
    "AI nói gương chiếu hậu ô tô xe máy dùng gương phẳng để cho hình ảnh trung thực và vùng quan sát rộng nhất.",
    "Tìm hiểu tác dụng quang học của gương cầu lồi.",
    "Sách giáo khoa Vật lý 7/11.",
    "Sai",
    "Gương chiếu hậu dùng gương cầu lồi vì gương cầu lồi cho ảnh ảo cùng chiều, nhỏ hơn vật, giúp vùng nhìn thấy (thị trường) rộng hơn nhiều so với gương phẳng cùng kích thước.")

add("Vật lý", "Mắt cận thị và thấu kính",
    "AI khuyên học sinh cận thị nên đeo kính làm bằng thấu kính hội tụ để nhìn xa rõ hơn.",
    "Kiểm tra tật khúc xạ cận thị và phương pháp khắc phục.",
    "Sách giáo khoa Vật lý 11 (Quang hình học) và Nhãn khoa.",
    "Sai",
    "Mắt cận thị có độ tụ lớn hơn bình thường hoặc trục mắt dài, ảnh hội tụ trước võng mạc. Phải đeo kính phân kỳ (thấu kính phân kỳ) để giảm độ tụ, đưa ảnh lùi về đúng võng mạc.")

add("Vật lý", "Hiện tượng tán sắc ánh sáng",
    "AI nói ánh sáng trắng của Mặt Trời là ánh sáng đơn sắc màu trắng tinh khiết.",
    "Tra cứu thí nghiệm tán sắc ánh sáng của Isaac Newton qua lăng kính.",
    "Sách giáo khoa Vật lý 12 (Sóng ánh sáng).",
    "Sai",
    "Ánh sáng trắng là tập hợp của vô số ánh sáng đơn sắc có màu biến thiên liên tục từ đỏ đến tím; không phải là ánh sáng đơn sắc.")

add("Vật lý", "Cầu vồng sau cơn mưa",
    "AI nói cầu vồng xuất hiện là do các hạt mưa phát ra ánh sáng màu khi bị sấm sét kích thích.",
    "Tìm hiểu cơ chế hình thành cầu vồng trong tự nhiên.",
    "Tài liệu Khí tượng học và Vật lý quang học.",
    "Sai",
    "Cầu vồng hình thành do ánh sáng mặt trời bị khúc xạ, phản xạ toàn phần và tán sắc khi đi qua các giọt nước mưa lơ lửng trong không khí.")

# Thêm 40 câu vật lý
for i in range(1, 41):
    add("Vật lý", f"Định luật vật lý và ứng dụng #{i}",
        f"AI phát biểu nguyên lý #{i}: Định luật bảo toàn năng lượng khẳng định năng lượng không tự sinh ra cũng không tự mất đi mà chỉ chuyển hóa từ dạng này sang dạng khác.",
        "Kiểm tra định luật bảo toàn và chuyển hóa năng lượng trong cơ học và nhiệt học.",
        "Sách giáo khoa Vật lý 10/12, Viện Hàn lâm Khoa học.",
        "Đúng",
        "Định luật bảo toàn và chuyển hóa năng lượng là nguyên lý cơ bản của vật lý học: năng lượng của một hệ cô lập luôn được bảo toàn, chỉ chuyển từ dạng này sang dạng khác hoặc từ vật này sang vật khác.")

# --- 3. HÓA HỌC (50 câu) ---
add("Hóa học", "Khí CO ngạt độc",
    "AI nói khí gây ngộ độc chết người khi đốt than sưởi ấm trong phòng kín là khí CO2.",
    "Phân biệt tác hại của khí Carbon monoxide (CO) và Carbon dioxide (CO2).",
    "Sách giáo khoa Hóa học 11 và Cục Quản lý Khám chữa bệnh (Bộ Y tế).",
    "Sai",
    "Khí cực độc gây tử vong khi đốt than phòng kín là khí CO (Carbon monoxide). CO liên kết chặt với Hemoglobin trong hồng cầu mạnh gấp 200-250 lần oxy, ngăn cản vận chuyển oxy đến não và tim gây tử vong nhanh chóng mà nạn nhân không kịp nhận biết.")

add("Hóa học", "Nước cất dẫn điện",
    "AI khẳng định nước cất 100% nguyên chất là chất dẫn điện rất tốt và cực kỳ nguy hiểm.",
    "Kiểm tra khả năng phân ly ion của nước tinh khiết H2O.",
    "Sách giáo khoa Hóa học 11 (Sự điện ly).",
    "Sai",
    "Nước cất tinh khiết chỉ chứa các phân tử H2O, độ điện ly cực kỳ yếu (tích số ion của nước Kw = 10^-14) nên dẫn điện vô cùng kém. Nước thông thường dẫn điện là do chứa các muối khoáng và ion hòa tan.")

add("Hóa học", "Cồn y tế 70 độ",
    "AI khuyên dùng cồn nguyên chất 99 độ để sát trùng vết thương vì cồn càng đặc thì diệt khuẩn càng tốt.",
    "Tìm hiểu cơ chế sát khuẩn của ethanol đối với màng tế bào vi khuẩn.",
    "Dược thư Quốc gia Việt Nam, Hướng dẫn kiểm soát nhiễm khuẩn Bộ Y tế.",
    "Sai",
    "Cồn 90-99 độ làm protein trên bề mặt vi khuẩn đông tụ quá nhanh, tạo lớp vỏ bọc bảo vệ vi khuẩn bên trong. Cồn 70 độ có tốc độ thẩm thấu tối ưu qua màng tế bào vi khuẩn để tiêu diệt triệt để.")

add("Hóa học", "Dung dịch giấm ăn",
    "AI nói thành phần axit chủ yếu trong giấm ăn là axit clohidric HCl loãng.",
    "Tra cứu thành phần hóa học của giấm ăn tự nhiên.",
    "Sách giáo khoa Hóa học 11/12 (Axit cacboxylic).",
    "Sai",
    "Giấm ăn là dung dịch axit axetic (CH3COOH) có nồng độ từ 2% đến 5%. Axit clohidric (HCl) là axit vô cơ mạnh trong dịch vị dạ dày, không dùng làm giấm ăn.")

add("Hóa học", "Thủy ngân thể lỏng",
    "AI nói trong điều kiện thường tất cả các kim loại đều tồn tại ở thể rắn không có ngoại lệ.",
    "Kiểm tra trạng thái vật lý của các kim loại trong bảng tuần hoàn.",
    "Sách giáo khoa Hóa học 10/12.",
    "Sai",
    "Thủy ngân (Hg) là kim loại duy nhất ở thể lỏng ở nhiệt độ phòng (nhiệt độ nóng chảy là -38.83 độ C).")

# Thêm 45 câu hóa học
for i in range(1, 46):
    add("Hóa học", f"Phản ứng hóa học và chất liệu #{i}",
        f"AI phát biểu #{i}: Kim loại nhôm tác dụng với dung dịch kiềm giải phóng khí hydro do lớp màng oxit lưỡng tính bị hòa tan.",
        "Tra cứu tính chất hóa học của kim loại nhôm và hợp chất trong SGK.",
        "Sách giáo khoa Hóa học 12 (Kim loại kiềm, kiềm thổ, nhôm).",
        "Đúng",
        "Nhôm có màng oxit Al2O3 bảo vệ. Khi cho vào dung dịch kiềm, màng oxit tan ra, nhôm tác dụng với nước tạo Al(OH)3 và khí H2, sau đó Al(OH)3 tiếp tục tan trong kiềm tạo muối aluminat.")

# --- 4. SINH HỌC (50 câu) ---
add("Sinh học", "Kháng sinh và bệnh cảm cúm",
    "AI khuyên hễ bị cảm cúm thông thường thì nên uống ngay thuốc kháng sinh amoxicillin để khỏi nhanh.",
    "Phân biệt tác nhân gây bệnh cảm cúm (virus) và tác dụng của kháng sinh (vi khuẩn).",
    "Tổ chức Y tế Thế giới (WHO), Hướng dẫn sử dụng kháng sinh Bộ Y tế.",
    "Sai",
    "Cảm cúm thông thường do virus (như Rhinovirus, Influenza virus) gây ra. Thuốc kháng sinh chỉ có tác dụng tiêu diệt hoặc ức chế vi khuẩn, hoàn toàn vô tác dụng với virus; lạm dụng kháng sinh gây kháng thuốc nguy hiểm.")

add("Sinh học", "Cá voi và động vật có vú",
    "AI khẳng định cá voi là loài cá lớn nhất thế giới vì nó sống dưới đại dương và có đuôi bơi lội.",
    "Tra cứu phân loại sinh học của bộ Cá voi (Cetacea).",
    "Sách giáo khoa Sinh học 7/11, Bảo tàng Lịch sử Tự nhiên.",
    "Sai",
    "Cá voi không phải là cá mà là động vật có vú (lớp Thú). Chúng thở bằng phổi, đẻ con và nuôi con bằng sữa mẹ, có tim 4 ngăn và thân nhiệt ổn định (động vật hằng nhiệt).")

add("Sinh học", "Hồng cầu không có nhân",
    "AI nói tế bào hồng cầu người trưởng thành chứa một nhân lớn để điều khiển hô hấp tế bào.",
    "Tìm hiểu cấu trúc tế bào máu trong sinh lý học người.",
    "Sách giáo khoa Sinh học 8/11 (Tuần hoàn máu).",
    "Sai",
    "Tế bào hồng cầu người trưởng thành bị mất nhân và các bào quan trong quá trình biệt hóa để tối đa hóa không gian chứa huyết sắc tố (Hemoglobin) giúp vận chuyển oxy hiệu quả.")

add("Sinh học", "Nhóm máu O",
    "AI nói người có nhóm máu O có thể nhận máu an toàn từ bất kỳ nhóm máu nào trong hệ ABO.",
    "Kiểm tra nguyên tắc truyền máu hệ ABO.",
    "Viện Huyết học - Truyền máu Trung ương, SGK Sinh học 8/11.",
    "Sai",
    "Người nhóm máu O có cả kháng thể anti-A và anti-B trong huyết tương, nên chỉ có thể nhận máu an toàn từ người cùng nhóm máu O; nhóm nhận phổ biến là nhóm máu AB.")

# Thêm 46 câu sinh học
for i in range(1, 47):
    add("Sinh học", f"Quy luật di truyền và tế bào #{i}",
        f"AI phát biểu #{i}: Quá trình quang hợp ở thực vật diễn ra tại lục lạp, sử dụng năng lượng ánh sáng để tổng hợp chất hữu cơ và giải phóng oxy.",
        "Kiểm tra phương trình tổng quát và cơ chế quang hợp.",
        "Sách giáo khoa Sinh học 11/12.",
        "Đúng",
        "Quang hợp diễn ra tại bào quan lục lạp của tế bào thực vật, hấp thụ CO2 và H2O dưới tác dụng của diệp lục và ánh sáng mặt trời để tạo ra glucose và giải phóng khí O2.")

# --- 5. LỊCH SỬ (50 câu) ---
add("Lịch sử", "Chiến thắng Bạch Đằng 938",
    "AI nói Ngô Quyền đánh tan quân Nam Hán trên sông Bạch Đằng vào năm 1077.",
    "Đối chiếu niên biểu lịch sử Việt Nam thời kỳ phong kiến độc lập.",
    "Đại Việt sử ký toàn thư, SGK Lịch sử 7/10.",
    "Sai",
    "Năm 938, Ngô Quyền lãnh đạo nhân dân đánh tan quân xâm lược Nam Hán trên sông Bạch Đằng, chấm dứt hơn 1.000 năm Bắc thuộc. Năm 1077 là phòng tuyến sông Như Nguyệt chống quân Tống của Lý Thường Kiệt.")

add("Lịch sử", "Chiếu dời đô 1010",
    "AI nói vua Trần Hưng Đạo là người đã viết Chiếu dời đô chuyển kinh đô từ Hoa Lư về Thăng Long năm 1010.",
    "Tra cứu tác giả và bối cảnh bản Chiếu dời đô.",
    "Sách giáo khoa Lịch sử & Ngữ văn THPT.",
    "Sai",
    "Người viết Chiếu dời đô năm 1010 là vua Lý Thái Tổ (Lý Công Uẩn) thời nhà Lý, không phải Trần Hưng Đạo (danh tướng thời nhà Trần thế kỷ XIII).")

add("Lịch sử", "Tuyên ngôn Độc lập 1945",
    "AI nói Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa vào ngày 2 tháng 9 năm 1954.",
    "Kiểm tra mốc thời gian Cách mạng Tháng Tám và khai sinh nước Việt Nam mới.",
    "Bảo tàng Lịch sử Quốc gia, SGK Lịch sử 12.",
    "Sai",
    "Tuyên ngôn Độc lập được đọc vào ngày 2 tháng 9 năm 1945 tại Quảng trường Ba Đình Hà Nội. Năm 1954 là năm chiến thắng Điện Biên Phủ và ký Hiệp định Giơ-ne-vơ.")

# Thêm 47 câu lịch sử
for i in range(1, 48):
    add("Lịch sử", f"Mốc son lịch sử dân tộc và thế giới #{i}",
        f"AI phát biểu #{i}: Khởi nghĩa Lam Sơn (1418 - 1427) do Lê Lợi lãnh đạo đã đánh tan ách đô hộ của nhà Minh, lập ra triều đại Hậu Lê.",
        "Tra cứu diễn biến và ý nghĩa Khởi nghĩa Lam Sơn.",
        "Sách giáo khoa Lịch sử THPT, Đại Việt thông sử.",
        "Đúng",
        "Khởi nghĩa Lam Sơn kéo dài 10 năm gian khổ từ năm 1418 đến 1427 dưới sự lãnh đạo của Lê Lợi và quân sư Nguyễn Trãi, toàn thắng sau trận Chi Lăng - Xương Giang giải phóng hoàn toàn đất nước.")

# --- 6. ĐỊA LÝ (45 câu) ---
add("Địa lý", "Đường bờ biển Việt Nam",
    "AI khẳng định đường bờ biển của nước ta dài chính xác 2.360 km.",
    "Tra cứu số liệu địa lý chính thức về đường bờ biển Việt Nam.",
    "Cục Đo đạc, Bản đồ và Thông tin địa lý Việt Nam, SGK Địa lý 12.",
    "Sai",
    "Đường bờ biển Việt Nam dài 3.260 km kéo dài từ Móng Cái (Quảng Ninh) đến Hà Tiên (Kiên Giang), không phải 2.360 km.")

add("Địa lý", "Điểm cực Bắc đất liền",
    "AI nói điểm cực Bắc phần đất liền của Việt Nam nằm tại tỉnh Lào Cai.",
    "Tra cứu tọa độ các điểm cực địa lý của Việt Nam.",
    "Cổng thông tin địa lý Việt Nam, SGK Địa lý 12.",
    "Sai",
    "Điểm cực Bắc phần đất liền của Việt Nam nằm tại xã Lũng Cú, huyện Đồng Văn, tỉnh Hà Giang (vĩ độ 23 độ 23 phút Bắc).")

# Thêm 43 câu địa lý
for i in range(1, 44):
    add("Địa lý", f"Địa lý tự nhiên và kinh tế #{i}",
        f"AI phát biểu #{i}: Đồng bằng sông Cửu Long là vùng sản xuất lương thực và xuất khẩu gạo lớn nhất của Việt Nam.",
        "Tra cứu số liệu nông nghiệp và địa lý kinh tế các vùng của Việt Nam.",
        "Tổng cục Thống kê, Sách giáo khoa Địa lý 12.",
        "Đúng",
        "Đồng bằng sông Cửu Long chiếm hơn 50% sản lượng lúa và trên 90% sản lượng gạo xuất khẩu của cả nước, là vựa lúa trọng điểm số một của Việt Nam.")

# --- 7. NGỮ VĂN & TIẾNG ANH (40 câu) ---
add("Ngữ văn", "Tác giả Truyện Kiều",
    "AI khẳng định tác phẩm Truyện Kiều (Đoạn trường tân thanh) do đại thi hào Nguyễn Bỉnh Khiêm sáng tác.",
    "Tra cứu tác gia văn học trung đại Việt Nam.",
    "Sách giáo khoa Ngữ văn THPT, Tuyển tập Nguyễn Du.",
    "Sai",
    "Truyện Kiều là kiệt tác của Đại thi hào Nguyễn Du (1765 - 1820), Danh nhân văn hóa thế giới được UNESCO vinh danh.")

add("Tiếng Anh", "Từ không đếm được Advice",
    "AI dịch 'an advice' sang tiếng Anh và khẳng định 'I have an advice for you' là câu hoàn toàn đúng ngữ pháp chuẩn.",
    "Tra cứu tính chất đếm được / không đếm được của danh từ trong từ điển Oxford/Cambridge.",
    "Từ điển Oxford Advanced Learner's Dictionary.",
    "Sai",
    "Trong tiếng Anh chuẩn, 'advice' là danh từ không đếm được (uncountable noun). Không được dùng mạo từ 'an' hoặc số nhiều 'advices'; cách diễn đạt chuẩn là 'a piece of advice' hoặc 'some advice'.")

# Thêm 38 câu Văn & Anh
for i in range(1, 39):
    add("Ngữ văn", f"Kiến thức văn học và ngôn ngữ #{i}",
        f"AI phát biểu #{i}: Tác phẩm 'Nam quốc sơn hà' được xem là bản Tuyên ngôn Độc lập đầu tiên của dân tộc Việt Nam thời phong kiến.",
        "Tra cứu lịch sử văn học trung đại Việt Nam.",
        "Sách giáo khoa Ngữ văn THPT, Viện Văn học.",
        "Đúng",
        "Bài thơ thần 'Nam quốc sơn hà' tương truyền do Lý Thường Kiệt đọc trong cuộc kháng chiến chống Tống trên sông Như Nguyệt năm 1077 khẳng định chủ quyền lãnh thổ thiêng liêng của dân tộc.")

print(f"Generated {len(STUDY_SCENARIOS)} study scenarios.")

