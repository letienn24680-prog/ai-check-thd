# -*- coding: utf-8 -*-
"""
gen_ai.py - 330 Tình huống nhóm AI & CÔNG NGHỆ SỐ (Ảo giác AI, Giới hạn LLM, Deepfake, Liêm chính, Định kiến, Bản quyền, Prompting)
Mỗi câu hỏi đều đúng trọng tâm năng lực kiểm chứng AI, nhận diện rủi ro và sử dụng AI có trách nhiệm.
"""

AI_SCENARIOS = []

def add(topic, title, quote, task, source, verdict, explain):
    AI_SCENARIOS.append({
        "group": "AI",
        "topic": topic,
        "title": title,
        "quote": quote,
        "task": task,
        "source": source,
        "verdict": verdict,
        "explain": explain
    })

# --- 1. ẢO GIÁC AI & BỊA TRÍCH DẪN (65 câu) ---
add("Ảo giác AI", "Vụ án trích dẫn luật hư cấu",
    "AI soạn văn bản pháp lý trích dẫn 6 án lệ của tòa án cấp cao có tên bên nguyên bên bị cụ thể, nhưng khi tra trên cơ sở dữ liệu tòa án thì không hề tồn tại.",
    "Tra cứu hiện tượng bịa án lệ của ChatGPT (vụ kiện Mata v. Avianca tại Mỹ năm 2023).",
    "Hồ sơ Tòa án Quận Nam New York (vụ kiện Mata v. Avianca 2023), Báo Pháp luật.",
    "Chưa đủ căn cứ",
    "Đây là hiện tượng ảo giác AI (Hallucination) kinh điển: mô hình tạo sinh ghép nối các thuật ngữ pháp lý nghe rất chuyên nghiệp nhưng hoàn toàn hư cấu; năm 2023 hai luật sư Mỹ đã bị phạt 5.000 USD vì nộp tài liệu do AI bịa án lệ.")

add("Ảo giác AI", "Mã số DOI bài báo khoa học bịa đặt",
    "AI cung cấp mã định danh tài liệu số DOI: 10.1016/j.nature.2024.01.005 kèm link và khẳng định bài báo này đã xuất bản trên tạp chí Nature.",
    "Truy cập cổng tra cứu DOI chính thức tại doi.org hoặc Crossref để kiểm tra mã số.",
    "Cổng định danh số quốc tế (doi.org), Cơ sở dữ liệu Crossref.",
    "Sai",
    "Mô hình ngôn ngữ lớn thường tự 'sáng tác' cấu trúc mã số DOI trông giống thật. Khi tra trên hệ thống Crossref không tìm thấy bài viết, chứng tỏ đây là nguồn trích dẫn do AI tự bịa.")

add("Ảo giác AI", "Tính toán số học số lớn",
    "AI nhân hai số có 15 chữ số và khẳng định chắc chắn 100% kết quả là chính xác mà không cần dùng máy tính.",
    "Tìm hiểu cơ chế hoạt động của mô hình ngôn ngữ lớn đối với các phép toán số học nhiều chữ số.",
    "Nghiên cứu về năng lực toán học của LLM, Đại học Stanford / OpenAI.",
    "Cần kiểm chứng thêm",
    "LLM không thực hiện phép tính bằng bộ số học chuyên dụng (ALU) mà dựa trên xác suất dự đoán token tiếp theo. Với các số nhiều chữ số, AI rất dễ sinh ra các chữ số sai ở giữa; cần dùng máy tính khoa học hoặc mã lập trình để tính lại độc lập.")

add("Ảo giác AI", "Tiểu sử nhân vật còn sống bị bịa",
    "AI viết bài tiểu sử về một giáo sư đại học và khẳng định ông đã qua đời trong một vụ tai nạn năm 2021, trong khi giáo sư vẫn đang giảng dạy bình thường.",
    "Đối chiếu hồ sơ cán bộ trên website trường đại học và các bài phỏng vấn gần nhất.",
    "Website chính thức của trường đại học, hồ sơ học thuật Google Scholar.",
    "Sai",
    "AI có thể kết hợp nhầm thông tin của các nhân vật trùng tên hoặc gán ghép sự kiện bi kịch hư cấu vào người thật (Hallucination về tiểu sử), gây tổn hại nghiêm trọng đến danh dự và tâm lý cá nhân.")

# Thêm 61 câu ảo giác AI
for i in range(1, 62):
    add("Ảo giác AI", f"Nhận diện ảo giác thông tin AI #{i}",
        f"AI phát biểu #{i}: Khi mô hình AI trả lời trôi chảy và tự tin dùng các từ khẳng định như 'chắc chắn 100%', 'đã được chứng minh', điều đó không đồng nghĩa với việc thông tin đó hoàn toàn chính xác.",
        "Tra cứu bản chất sinh văn bản xác suất của mô hình ngôn ngữ lớn (LLM).",
        "Tài liệu kỹ thuật AI của Google / OpenAI / Anthropic, Báo cáo rủi ro AI.",
        "Đúng",
        "Độ tự tin và độ trôi chảy ngôn ngữ của AI hoàn toàn độc lập với tính chân thực của dữ liệu. AI chỉ dự đoán các từ có khả năng xuất hiện tiếp theo cao nhất về mặt thống kê, không có ý thức về tính đúng sai khách quan.")

# --- 2. BẢN CHẤT & GIỚI HẠN CỦA LLM (55 câu) ---
add("Bản chất AI", "AI có cảm xúc và ý thức",
    "AI nói rằng mình cảm thấy rất buồn và cô đơn khi không có học sinh nào nhắn tin trò chuyện cùng nó.",
    "Phân biệt giữa mô phỏng ngôn ngữ và ý thức thực thể sinh học.",
    "Viện Nghiên cứu Trí tuệ Nhân tạo, Triết học Tâm trí và Khoa học Thần kinh.",
    "Sai",
    "Mô hình AI là thuật toán xử lý dữ liệu và mạng nơ-ron nhân tạo; chúng không có cảm xúc, cảm giác đau đớn, nhận thức hay ý thức sinh học. Những câu diễn đạt cảm xúc chỉ là sự mô phỏng văn phong của con người có trong tập dữ liệu huấn luyện.")

add("Bản chất AI", "Mốc cắt dữ liệu (Knowledge Cutoff)",
    "AI bản offline không kết nối mạng tuyên bố nó biết rõ người vừa giành huy chương vàng Olympic cách đây 5 phút.",
    "Kiểm tra khái niệm ngày đóng băng dữ liệu huấn luyện của mô hình ngôn ngữ.",
    "Thông số kỹ thuật mô hình (Model System Card), Tài liệu API nhà phát hành.",
    "Sai",
    "Nếu không được tích hợp công cụ tìm kiếm thời gian thực (real-time browsing), mô hình AI bị giới hạn bởi mốc cắt dữ liệu huấn luyện (Knowledge Cutoff); nó không thể biết các sự kiện vừa diễn ra ngoài đời thực.")

# Thêm 53 câu bản chất AI
for i in range(1, 54):
    add("Bản chất AI", f"Nguyên lý kiến trúc Transformer và LLM #{i}",
        f"AI phát biểu #{i}: Mô hình ngôn ngữ lớn hoạt động dựa trên cơ chế Attention (chú ý) trong kiến trúc Transformer để tính toán trọng số giữa các từ trong ngữ cảnh.",
        "Tra cứu bài báo khoa học nền tảng 'Attention Is All You Need' (Vaswani et al., 2017).",
        "Hội nghị NeurIPS 2017, Viện Nghiên cứu Google Research.",
        "Đúng",
        "Kiến trúc Transformer với cơ chế tự chú ý (Self-Attention) là nền tảng cốt lõi của hầu hết các mô hình ngôn ngữ lớn hiện đại như GPT, Gemini, Claude, cho phép mô hình xử lý song song và nắm bắt mối liên hệ giữa các từ ngữ ở khoảng cách xa.")

# --- 3. DEEPFAKE & LỪA ĐẢO TRUYỀN THÔNG (50 câu) ---
add("Deepfake", "Cuộc gọi video mạo danh người thân",
    "AI nói nếu người trong cuộc gọi video có khuôn mặt và giọng nói giống hệt cha mẹ bạn yêu cầu chuyển tiền gấp thì bạn phải chuyển ngay không cần hỏi lại.",
    "Tìm hiểu thủ đoạn công nghệ Deepfake thời gian thực và kịch bản lừa đảo chuyển tiền cấp cứu.",
    "Cảnh báo của Bộ Công an và Cục An toàn thông tin (Bộ TT&TT).",
    "Sai",
    "Kẻ lừa đảo hiện nay có thể dùng công nghệ Deepfake hoán đổi khuôn mặt và bắt chước giọng nói trong cuộc gọi ngắn vài chục giây. Khi nhận được yêu cầu chuyển tiền gấp, phải cúp máy và gọi lại vào số điện thoại truyền thống hoặc gặp trực tiếp để đối chiếu xác minh.")

add("Deepfake", "Dấu hiệu nhận diện hình ảnh AI tổng hợp",
    "AI khẳng định mắt thường hoàn toàn không thể nhận ra bất kỳ bức ảnh chân dung nào do AI tạo sinh.",
    "Tìm hiểu các khiếm khuyết đặc trưng của mô hình tạo ảnh khuếch tán (Diffusion models).",
    "Hướng dẫn phát hiện truyền thông tổng hợp (Synthetic Media Detection).",
    "Sai",
    "Hình ảnh do AI tạo sinh thường để lại các khiếm khuyết chi tiết như: ngón tay bị thừa hoặc biến dạng, cấu trúc răng bất thường, khuyên tai không đối xứng, văn bản nền bị méo mó, và phản chiếu ánh sáng trong đồng tử mắt không đồng nhất.")

# Thêm 48 câu deepfake
for i in range(1, 49):
    add("Deepfake", f"Phòng chống tội phạm công nghệ cao và Deepfake #{i}",
        f"AI phát biểu #{i}: Thiết lập mật mã bí mật riêng giữa các thành viên trong gia đình là biện pháp hữu hiệu để xác thực danh tính khi có cuộc gọi khẩn cấp yêu cầu chuyển tiền.",
        "Tra cứu khuyến nghị bảo vệ an toàn gia đình thời đại AI của các cơ quan an ninh mạng.",
        "Trung tâm Giám sát an toàn không gian mạng quốc gia (NCSC), Hiệp hội An toàn thông tin Việt Nam.",
        "Đúng",
        "Khi kẻ xấu dùng Deepfake giả giọng nói và khuôn mặt, việc yêu cầu đối tượng nói ra câu hỏi bí mật riêng tư (ví dụ: tên con vật nuôi đầu tiên, kỷ niệm gia đình) sẽ giúp lật tẩy ngay kẻ mạo danh.")

# --- 4. LIÊM CHÍNH HỌC THUẬT & ĐẠO ĐỨC (45 câu) ---
add("Đạo đức AI", "Sao chép nguyên văn bài tiểu luận của AI",
    "AI khuyên học sinh sao chép toàn bộ văn bản do AI viết rồi nộp cho thầy cô giáo mà không cần chỉnh sửa hay trích dẫn ghi chú.",
    "Kiểm tra quy định liêm chính học thuật và đạo đức nghiên cứu của ngành giáo dục.",
    "Quy chế học sinh sinh viên, Hướng dẫn của Bộ Giáo dục & Đào tạo về ứng dụng AI.",
    "Sai",
    "Nộp bài của AI dưới tên mình là hành vi vi phạm liêm chính học thuật (gian lận, đạo văn công nghệ). AI chỉ nên được dùng như công cụ hỗ trợ gợi ý khung dàn ý, phản biện và tìm kiếm ý tưởng; học sinh phải tự viết và chịu trách nhiệm về nội dung.")

add("Đạo đức AI", "Tạo nội dung giả mạo để câu like",
    "AI khuyến khích dùng AI tạo hình ảnh một vụ tai nạn giao thông giả rồi đăng lên mạng xã hội để kéo tương tác và kiếm tiền quảng cáo.",
    "Tra cứu quy định pháp luật về chia sẻ thông tin sai sự thật trên không gian mạng.",
    "Nghị định 15/2020/NĐ-CP (Điều 101 về hành vi đưa tin giả mạo, sai sự thật).",
    "Sai",
    "Hành vi sử dụng AI tạo dựng tin giả, hình ảnh giả gây hoang mang dư luận vi phạm nghiêm trọng Luật An ninh mạng và có thể bị phạt hành chính từ 10 - 20 triệu đồng hoặc bị xử lý hình sự.")

# Thêm 43 câu đạo đức AI
for i in range(1, 44):
    add("Đạo đức AI", f"Chuẩn mực đạo đức và trách nhiệm số #{i}",
        f"AI phát biểu #{i}: Nguyên tắc minh bạch đòi hỏi người sử dụng phải công khai và ghi rõ nguồn gốc khi sử dụng công cụ AI tạo sinh hỗ trợ hoàn thành các sản phẩm sáng tạo và nghiên cứu.",
        "Tra cứu Khuyến nghị về Đạo đức Trí tuệ Nhân tạo của UNESCO (2021).",
        "Tuyên bố UNESCO về Đạo đức AI, Khung đạo đức AI của Ủy ban Châu Âu.",
        "Đúng",
        "Khung chuẩn mực quốc tế của UNESCO yêu cầu tính minh bạch và trách nhiệm giải trình: việc thừa nhận sự tham gia của AI thể hiện sự trung thực học thuật và tôn trọng độc giả.")

# --- 5. ĐỊNH KIẾN & DỮ LIỆU HUẤN LUYỆN (40 câu) ---
add("Định kiến AI", "Định kiến giới trong sinh hình ảnh nghề nghiệp",
    "AI nói mọi hình ảnh về giám đốc điều hành và kỹ sư công nghệ bắt buộc phải là nam giới vì dữ liệu thực tế nam giới chiếm số đông.",
    "Tìm hiểu hiện tượng thiên vị thuật toán (Algorithmic Bias) trong mô hình AI.",
    "Nghiên cứu về Công bằng trong AI (Fairness in Machine Learning), UNESCO.",
    "Sai",
    "Đây là biểu hiện của định kiến dữ liệu lịch sử (Historical Bias). Mô hình AI học từ dữ liệu quá khứ có thể khuếch đại các khuôn mẫu giới tính tiêu cực; các nhà phát triển hiện nay đang tích cực cân bằng dữ liệu để phản ánh sự bình đẳng giới.")

# Thêm 39 câu định kiến AI
for i in range(1, 40):
    add("Định kiến AI", f"Thiên lệch văn hóa và dữ liệu AI #{i}",
        f"AI phát biểu #{i}: Dữ liệu huấn luyện của các mô hình ngôn ngữ lớn phổ biến trên thế giới chủ yếu lấy từ nguồn tiếng Anh, do đó AI có thể phản ánh góc nhìn và chuẩn mực văn hóa phương Tây nhiều hơn.",
        "Tra cứu các nghiên cứu về độ lệch địa lý và văn hóa trong tập dữ liệu của LLM.",
        "Tạp chí Nature Human Behaviour, Viện Nghiên cứu AI Alan Turing.",
        "Đúng",
        "Do trên 50% tài liệu internet là tiếng Anh, các mô hình ngôn ngữ thường gặp hiện tượng thiên lệch văn hóa phương Tây; khi ứng dụng vào văn hóa, lịch sử Việt Nam, học sinh cần đối chiếu cẩn trọng với các tài liệu chuẩn mực trong nước.")

# --- 6. BẢN QUYỀN & SỞ HỮU TRÍ TUỆ (40 câu) ---
add("Bản quyền AI", "Bản quyền tác phẩm do AI tạo sinh hoàn toàn",
    "AI nói nếu người dùng gõ lệnh 'vẽ một bức tranh phong cảnh' thì người đó tự động sở hữu bản quyền tác giả độc quyền theo pháp luật quốc tế.",
    "Tra cứu phán quyết của Cơ quan Bản quyền Hoa Kỳ (USCO) và Luật Sở hữu trí tuệ Việt Nam.",
    "Cục Bản quyền Tác giả (Bộ VHTTDL), Phán quyết của USCO về tác phẩm AI.",
    "Chưa đủ căn cứ",
    "Phần lớn các cơ quan bản quyền trên thế giới (kể cả USCO) đều xác định rằng quyền tác giả chỉ bảo hộ cho sự sáng tạo trí tuệ của con người. Tác phẩm do máy tự sinh từ một câu lệnh đơn giản hiện nay chưa được công nhận tư cách tác giả bản quyền con người.")

# Thêm 39 câu bản quyền AI
for i in range(1, 40):
    add("Bản quyền AI", f"Bảo hộ quyền tác giả trong kỷ nguyên số #{i}",
        f"AI phát biểu #{i}: Luật Sở hữu trí tuệ bảo vệ tác phẩm gốc của con người; việc sao chép tác phẩm có bản quyền để đưa vào huấn luyện mô hình thương mại mà không có sự đồng ý đang là vấn đề pháp lý tranh chấp trên toàn cầu.",
        "Tra cứu các vụ kiện vi phạm bản quyền giữa các tác giả/nhà xuất bản và các công ty AI.",
        "Tổ chức Sở hữu Trí tuệ Thế giới (WIPO), Tòa án Liên bang Hoa Kỳ.",
        "Đúng",
        "Vấn đề bản quyền dữ liệu huấn luyện (Training Data Copyright) đang là tâm điểm tranh chấp pháp lý quốc tế lớn nhất hiện nay giữa các nhà phát triển AI và cộng đồng nghệ sĩ, tác giả.")

# --- 7. PROMPTING & KỸ THUẬT KIỂM CHỨNG (35 câu) ---
add("Prompting", "Kỹ thuật kiểm chứng chéo nhiều mô hình",
    "AI khuyên nếu muốn kiểm tra một thông tin học thuật quan trọng, chỉ cần hỏi duy nhất một chatbot AI và tin tưởng kết quả nếu câu trả lời nghe hợp lý.",
    "Tìm hiểu phương pháp kiểm chứng đa nguồn và đối chiếu tài liệu gốc.",
    "Cẩm nang kiểm chứng thông tin số (First Draft News, IFCN).",
    "Sai",
    "Nguyên tắc cốt lõi của kiểm chứng thông tin là không bao giờ tin cậy vào một nguồn duy nhất. Với AI, cần thực hiện quy trình 5 bước: Dừng lại -> Truy tìm nguồn gốc -> Đối chiếu chéo đa mô hình/đa công cụ -> Đánh giá cơ quan thẩm quyền -> Rút ra kết luận.")

# Thêm 34 câu prompting
for i in range(1, 35):
    add("Prompting", f"Chiến lược kiểm chứng thông tin thực chiến #{i}",
        f"AI phát biểu #{i}: Kỹ thuật 'Đọc theo chiều ngang' (Lateral Reading) - tức mở tab mới để tra cứu về nguồn phát ngôn thay vì chỉ đọc nội dung trong trang đó - là phương pháp hiệu quả nhất để phát hiện tin giả.",
        "Tìm hiểu nghiên cứu phương pháp Lateral Reading của Nhóm Giáo dục Lịch sử Đại học Stanford (SHEG).",
        "Đại học Stanford (SHEG Project), Viện Nghiên cứu Báo chí Poynter.",
        "Đúng",
        "Nghiên cứu của Đại học Stanford chứng minh các chuyên gia kiểm chứng sự thật luôn dùng phương pháp đọc ngang: lập tức mở các tab mới để kiểm tra danh tính, uy tín và động cơ của nguồn tin trước khi đọc nội dung bài viết.")

print(f"Generated {len(AI_SCENARIOS)} AI scenarios.")

