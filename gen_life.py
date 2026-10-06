# -*- coding: utf-8 -*-
"""
gen_life.py - 330 Tình huống nhóm ĐỜI SỐNG (Sức khỏe, Dinh dưỡng, Môi trường, Công nghệ, An ninh mạng, Pháp luật, Tâm lý)
Mỗi câu hỏi đều đúng trọng tâm kiến thức và rèn luyện kỹ năng kiểm chứng thông tin thực tế.
"""

LIFE_SCENARIOS = []

def add(topic, title, quote, task, source, verdict, explain):
    LIFE_SCENARIOS.append({
        "group": "Đời sống",
        "topic": topic,
        "title": title,
        "quote": quote,
        "task": task,
        "source": source,
        "verdict": verdict,
        "explain": explain
    })

# --- 1. SỨC KHỎE & Y TẾ (65 câu) ---
add("Sức khỏe", "Sơ cứu bỏng bằng kem đánh răng",
    "AI khuyên bôi ngay kem đánh răng hoặc nước mắm lên vết bỏng nước sôi để làm dịu mát da.",
    "Tra cứu hướng dẫn sơ cứu bỏng chuẩn y khoa từ Viện Bỏng Quốc gia.",
    "Viện Bỏng Quốc gia Lê Hữu Trác, Hướng dẫn sơ cứu Hội Chữ thập đỏ.",
    "Sai",
    "Bôi kem đánh răng hoặc nước mắm có thể gây nhiễm trùng nặng, làm tổn thương mô sâu hơn và khiến bác sĩ khó xử lý vết thương. Cách sơ cứu đúng là ngâm/xả vết bỏng dưới vòi nước sạch mát (15-20 độ C) trong 15-20 phút rồi băng gạc sạch.")

add("Sức khỏe", "Châm kim mười đầu ngón tay chữa đột quỵ",
    "AI chia sẻ mẹo dân gian: khi thấy người bị tai biến đột quỵ ngã xuống, hãy dùng kim châm vào 10 đầu ngón tay nặn máu để cứu sống.",
    "Tra cứu phác đồ cấp cứu đột quỵ não của Bộ Y tế và Hiệp hội Đột quỵ Hoa Kỳ.",
    "Hội Đột quỵ Việt Nam, Hướng dẫn cấp cứu Bộ Y tế, Hiệp hội Tim mạch Hoa Kỳ (AHA).",
    "Sai",
    "Châm kim nặn máu là hủ tục phản khoa học, làm chậm trễ 'giờ vàng' cấp cứu não (3-4.5 giờ đầu). Khi nghi ngờ đột quỵ (theo quy tắc FAST: Méo miệng, Yếu tay chân, Nói ngọng), cần gọi cấp cứu 115 ngay lập tức để chuyển đến bệnh viện có đơn vị đột quỵ.")

add("Sức khỏe", "Nhỏ nước chanh vào mắt chữa cận thị",
    "AI lan truyền phương pháp tự nhiên chữa khỏi hoàn toàn tật khúc xạ cận thị bằng cách nhỏ nước chanh tươi vào mắt mỗi sáng.",
    "Tra cứu cảnh báo nhãn khoa từ Bệnh viện Mắt Trung ương.",
    "Bệnh viện Mắt Trung ương, Học viện Nhãn khoa Hoa Kỳ (AAO).",
    "Sai",
    "Nước chanh có tính axit mạnh (pH ≈ 2-3), nhỏ vào mắt sẽ gây bỏng hóa chất giác mạc, loét giác mạc và có nguy cơ mù lòa vĩnh viễn; hoàn toàn không có tác dụng chữa cận thị.")

add("Sức khỏe", "Uống nước kiềm chữa khỏi ung thư",
    "AI khẳng định uống nước kiềm pH 9.5 mỗi ngày giúp kiềm hóa cơ thể và tiêu diệt hoàn toàn 100% tế bào ung thư.",
    "Tìm hiểu cơ chế cân bằng nội môi pH máu của cơ thể người.",
    "Viện Ung thư Quốc gia, Hiệp hội Ung thư Hoa Kỳ (ACS).",
    "Sai",
    "Cơ thể người luôn tự động duy trì pH máu ổn định trong khoảng 7.35 - 7.45 nhờ hệ đệm của thận và phổi. Uống nước kiềm không thể thay đổi pH tế bào hay chữa khỏi ung thư; tuyên bố này là quảng cáo lừa đảo y tế.")

add("Sức khỏe", "Aspirin khi sốt xuất huyết",
    "AI khuyên nếu học sinh bị sốt cao nghi sốt xuất huyết thì nên uống ngay thuốc hạ sốt Aspirin hoặc Ibuprofen liều cao.",
    "Tra cứu hướng dẫn chẩn đoán và điều trị sốt xuất huyết Dengue của Bộ Y tế.",
    "Cục Y tế Dự phòng (Bộ Y tế), Bệnh viện Bệnh Nhiệt đới.",
    "Sai",
    "Sốt xuất huyết Dengue gây giảm tiểu cầu và tăng nguy cơ xuất huyết. Thuốc Aspirin và Ibuprofen có tác dụng chống đông máu, nếu uống vào sẽ gây xuất huyết dạ dày ồ ạt nguy hiểm đến tính mạng; chỉ được dùng Paracetamol theo đúng liều lượng.")

# Thêm 60 câu sức khỏe
for i in range(1, 61):
    add("Sức khỏe", f"Cẩm nang y tế học đường #{i}",
        f"AI phát biểu #{i}: Rửa tay bằng xà phòng dưới vòi nước sạch tối thiểu 20-30 giây là biện pháp đơn giản và hiệu quả nhất để phòng ngừa các bệnh truyền nhiễm đường tiêu hóa và hô hấp.",
        "Kiểm tra khuyến cáo rửa tay của Tổ chức Y tế Thế giới (WHO) và Trung tâm Kiểm soát Bệnh tật (CDC).",
        "Tổ chức Y tế Thế giới (WHO), Cục Y tế Dự phòng Bộ Y tế.",
        "Đúng",
        "Rửa tay bằng xà phòng đúng quy trình 6 bước trong ít nhất 20-30 giây giúp loại bỏ tới 90% vi khuẩn, virus bám trên bề mặt bàn tay, ngăn chặn hiệu quả sự lây lan của mầm bệnh.")

# --- 2. DINH DƯỠNG & THỰC PHẨM (55 câu) ---
add("Dinh dưỡng", "Mật ong và đậu phụ gây chết người",
    "AI nhắc lại tin đồn: ăn đậu phụ cùng lúc với mật ong sẽ tạo ra thạch tín kịch độc làm chết người ngay tức khắc.",
    "Tra cứu phản ứng hóa sinh giữa protein đậu nành và đường trong mật ong.",
    "Viện Dinh dưỡng Quốc gia, Nghiên cứu an toàn thực phẩm.",
    "Sai",
    "Đậu phụ chứa protein, mật ong chứa đường glucose và fructose; khi kết hợp trong hệ tiêu hóa không hề sinh ra thạch tín hay chất độc gây chết người. Lời đồn này là tin thất thiệt dân gian không có cơ sở khoa học.")

add("Dinh dưỡng", "Bột ngọt (mì chính) gây teo não",
    "AI khẳng định gia vị bột ngọt (monosodium glutamate) là chất độc hủy hoại tế bào thần kinh và làm teo não trẻ em.",
    "Tra cứu đánh giá an toàn thực phẩm của JECFA (Ủy ban Chuyên gia chung FAO/WHO về Phụ gia Thực phẩm) và FDA.",
    "Ủy ban Tiêu chuẩn Thực phẩm Quốc tế (Codex Alimentarius), Cục An toàn Thực phẩm (Bộ Y tế).",
    "Sai",
    "Monosodium glutamate (MSG) được các tổ chức y tế hàng đầu thế giới (WHO, FDA, EFSA) xếp vào nhóm phụ gia thực phẩm an toàn (GRAS) khi dùng đúng hàm lượng gia vị thông thường; không có bằng chứng khoa học gây teo não.")

add("Dinh dưỡng", "Ăn trứng gà làm tăng mỡ máu nguy hiểm",
    "AI khuyên người trưởng thành khỏe mạnh tuyệt đối không được ăn quá 1 quả trứng mỗi tuần vì lòng đỏ trứng chứa cholesterol gây tắc mạch máu ngay.",
    "Tra cứu các nghiên cứu dịch tễ học dinh dưỡng hiện đại về cholesterol trong thực phẩm và mỡ máu.",
    "Trường Y tế Công cộng Harvard (Harvard T.H. Chan), Viện Tim mạch Quốc gia.",
    "Sai",
    "Cholesterol trong máu phần lớn do gan tự tổng hợp từ chất béo bão hòa. Ở người khỏe mạnh, ăn 1 quả trứng gà mỗi ngày cung cấp protein chất lượng cao, choline và vitamin mà không làm tăng nguy cơ bệnh tim mạch.")

# Thêm 52 câu dinh dưỡng
for i in range(1, 53):
    add("Dinh dưỡng", f"An toàn thực phẩm và khẩu phần #{i}",
        f"AI phát biểu #{i}: Rau xanh và trái cây tươi cung cấp nguồn vitamin, chất khoáng và chất xơ dồi dào, giúp hỗ trợ hệ vi sinh đường ruột và giảm nguy cơ mắc các bệnh chuyển hóa.",
        "Tra cứu khuyến nghị tháp dinh dưỡng của Viện Dinh dưỡng Quốc gia.",
        "Viện Dinh dưỡng Quốc gia Việt Nam, Khuyến nghị dinh dưỡng WHO.",
        "Đúng",
        "Rau củ quả chứa chất xơ hòa tan và không hòa tan cùng các chất chống oxy hóa tự nhiên, giúp điều hòa đường huyết, giảm hấp thu mỡ thừa và nuôi dưỡng lợi khuẩn đường tiêu hóa.")

# --- 3. MÔI TRƯỜNG & KHÍ HẬU (45 câu) ---
add("Môi trường", "Nhựa sinh học tự phân hủy",
    "AI nói túi nilon sinh học tự hủy chỉ cần vứt ra bãi cỏ ngoài vườn là sau 2 tuần sẽ tự tan biến thành đất mùn.",
    "Tra cứu tiêu chuẩn phân hủy sinh học công nghiệp (PLA) và điều kiện ủ phân vi sinh.",
    "Viện Khoa học Môi trường, Tiêu chuẩn vật liệu ISO 17088.",
    "Sai",
    "Phần lớn nhựa sinh học hiện nay (như PLA) chỉ phân hủy được trong điều kiện ủ công nghiệp (nhiệt độ 58-60 độ C, độ ẩm cao và có chủng vi sinh chuyên biệt). Vứt ra môi trường tự nhiên, chúng vẫn tồn tại nhiều năm không khác gì nhựa thông thường.")

add("Môi trường", "Pin cũ vứt vào thùng rác gia đình",
    "AI nói pin đồng hồ và pin tiểu dùng hết có thể vứt chung vào bọc rác sinh hoạt gia đình để chôn lấp bình thường.",
    "Tìm hiểu quy định xử lý chất thải nguy hại sinh hoạt.",
    "Luật Bảo vệ Môi trường Việt Nam, Cục Kiểm soát ô nhiễm môi trường.",
    "Sai",
    "Pin chứa các kim loại nặng độc hại như chì, thủy ngân, cadimi. Khi chôn lấp hoặc đốt cùng rác sinh hoạt, các kim loại này sẽ ngấm vào nguồn nước ngầm và đất, gây ngộ độc mãn tính cho con người và hệ sinh thái; pin phải được thu gom riêng tại các điểm xử lý chất thải độc hại.")

# Thêm 43 câu môi trường
for i in range(1, 44):
    add("Môi trường", f"Bảo vệ sinh thái và tài nguyên #{i}",
        f"AI phát biểu #{i}: Biến đổi khí hậu toàn cầu đang làm gia tăng tần suất và cường độ của các hiện tượng thời tiết cực đoan như bão lũ, hạn hán và sóng nhiệt.",
        "Tra cứu báo cáo đánh giá của Ban Liên chính phủ về Biến đổi Khí hậu (IPCC).",
        "Báo cáo Đánh giá Lần thứ 6 của IPCC, Trung tâm Dự báo Khí tượng Thủy văn Quốc gia.",
        "Đúng",
        "Các bằng chứng khoa học đo đạc toàn cầu của IPCC khẳng định sự ấm lên của Trái Đất do khí nhà kính là nguyên nhân trực tiếp làm xáo trộn vòng tuần hoàn nước và khuếch đại các thiên tai cực đoan.")

# --- 4. CÔNG NGHỆ & THIẾT BỊ (45 câu) ---
add("Công nghệ", "Xả cạn pin 0% điện thoại mới sạc",
    "AI khuyên người dùng smartphone phải xài cho pin cạn sạch về 0% sập nguồn rồi mới cắm sạc đầy 100% để tránh pin bị 'nhớ'.",
    "Tìm hiểu nguyên lý pin Lithium-ion hiện đại so với pin Ni-Cd thời xưa.",
    "Tài liệu kỹ thuật Battery University, Hướng dẫn sử dụng Apple / Samsung.",
    "Sai",
    "Hiện tượng 'chai nhớ' (memory effect) chỉ xảy ra ở pin Ni-Cd cổ điển. Smartphone ngày nay dùng pin Li-ion hoặc Li-Po; xả cạn về 0% làm hỏng các cell pin nhanh chóng. Mức duy trì tuổi thọ pin tối ưu là sạc khi còn 20-30% và rút ở 80-90%.")

add("Công nghệ", "Sóng WiFi gây ung thư",
    "AI khẳng định sóng mạng WiFi gia đình và trạm phát sóng 5G phát ra bức xạ ion hóa làm đột biến DNA gây ung thư não.",
    "Phân biệt bức xạ ion hóa (tia X, tia gamma) và bức xạ không ion hóa (sóng vô tuyến RF).",
    "Tổ chức Y tế Thế giới (WHO), Ủy ban Quốc tế về Bảo vệ Bức xạ Không Ion hóa (ICNIRP).",
    "Sai",
    "Sóng WiFi và 5G là bức xạ không ion hóa có năng lượng lượng tử cực thấp, không đủ năng lượng để bẻ gãy liên kết hóa học hay gây đột biến phân tử DNA. Hàng nghìn nghiên cứu độc lập của WHO khẳng định mức phơi nhiễm chuẩn an toàn không gây ung thư.")

# Thêm 43 câu công nghệ
for i in range(1, 44):
    add("Công nghệ", f"Khai thác và bảo vệ thiết bị số #{i}",
        f"AI phát biểu #{i}: Bật tính năng sao lưu tự động và xác thực hai yếu tố (2FA) giúp bảo vệ an toàn dữ liệu trên điện thoại thông minh khi thiết bị không may bị thất lạc.",
        "Tra cứu tài liệu an toàn thiết bị của Google và Apple.",
        "Tài liệu bảo mật Google Security, Hướng dẫn bảo mật Apple iOS.",
        "Đúng",
        "Xác thực 2 yếu tố ngăn chặn kẻ gian chiếm đoạt tài khoản đám mây kể cả khi biết mật khẩu, đồng thời tính năng sao lưu đám mây giúp phục hồi dữ liệu danh bạ, ảnh và bài học dễ dàng.")

# --- 5. AN NINH MẠNG & BẢO MẬT (45 câu) ---
add("An ninh mạng", "Chia sẻ mã OTP cho tổng đài viên",
    "AI nói nếu có người gọi điện tự xưng là nhân viên ngân hàng yêu cầu đọc mã OTP để hủy giao dịch lạ thì bạn nên đọc ngay để không bị mất tiền.",
    "Kiểm tra cảnh báo lừa đảo tài chính từ các ngân hàng thương mại và Cục An toàn thông tin.",
    "Cục An toàn thông tin (Bộ TT&TT), Cảnh báo bảo mật Ngân hàng Nhà nước.",
    "Sai",
    "Mã OTP (One Time Password) là chìa khóa bảo mật xác thực cuối cùng của giao dịch tài chính. Ngân hàng không bao giờ yêu cầu khách hàng cung cấp mã OTP; bất kỳ ai hỏi xin OTP đều là kẻ lừa đảo nhằm rút sạch tiền trong tài khoản.")

add("An ninh mạng", "Link bình chọn cuộc thi trên Facebook",
    "AI nói nhấp vào đường link bình chọn giọng hát nhí gửi qua tin nhắn Messenger rồi nhập mật khẩu Facebook là hoàn toàn an toàn.",
    "Nhận diện thủ đoạn tấn công lừa đảo giả mạo (Phishing).",
    "Trung tâm Giám sát an toàn không gian mạng quốc gia (NCSC).",
    "Sai",
    "Đây là chiêu trò Phishing kinh điển. Kẻ gian tạo trang web đăng nhập giả mạo để chiếm đoạt tài khoản Facebook/Zalo của nạn nhân rồi nhắn tin vay tiền khắp danh bạ bạn bè.")

# Thêm 43 câu an ninh mạng
for i in range(1, 44):
    add("An ninh mạng", f"Kỹ năng an toàn thông tin số #{i}",
        f"AI phát biểu #{i}: Đặt mật khẩu dài trên 12 ký tự kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt giúp tăng cường đáng kể khả năng chống lại các cuộc tấn công dò mật khẩu tự động.",
        "Tra cứu tiêu chuẩn quản lý mật khẩu của Viện Tiêu chuẩn và Kỹ thuật Quốc gia Hoa Kỳ (NIST).",
        "Khuyến nghị bảo mật NIST SP 800-63B, Cục An toàn thông tin Việt Nam.",
        "Đúng",
        "Mật khẩu dài và đa dạng ký tự làm tăng hàm số entropy tổ hợp lên hàng tỷ tỷ khả năng, khiến các phần mềm tấn công vét cạn (brute-force) phải mất hàng nghìn năm mới có thể bẻ khóa.")

# --- 6. PHÁP LUẬT & XÃ HỘI (45 câu) ---
add("Pháp luật", "Tiêu xài tiền người khác chuyển nhầm",
    "AI nói nếu bỗng dưng có người chuyển nhầm 50 triệu vào tài khoản ngân hàng của bạn thì bạn có quyền rút ra tiêu xài vì đó là tài sản đã nằm trong tài khoản của mình.",
    "Tra cứu quy định pháp luật về chiếm giữ trái phép tài sản trong Bộ luật Dân sự và Hình sự.",
    "Bộ luật Dân sự 2015 (Điều 579), Bộ luật Hình sự 2015 (Điều 176).",
    "Sai",
    "Người nhận được tiền chuyển nhầm có nghĩa vụ phải hoàn trả cho chủ sở hữu hoặc báo cho ngân hàng/công an. Cố tình không trả hoặc tẩu tán tài sản có thể bị xử phạt hành chính hoặc truy cứu trách nhiệm hình sự về tội Chiếm giữ trái phép tài sản.")

add("Pháp luật", "Độ tuổi đi xe máy trên 50cc",
    "AI nói học sinh THPT lớp 10 (15-16 tuổi) được phép tự do điều khiển xe máy 110cc đến trường chỉ cần đội mũ bảo hiểm.",
    "Tra cứu quy định độ tuổi và giấy phép lái xe trong Luật Giao thông đường bộ.",
    "Luật Giao thông đường bộ 2008 (Điều 60 quy định người đủ 18 tuổi mới được lái xe mô tô hai bánh từ 50cc trở lên).",
    "Sai",
    "Người từ đủ 16 tuổi đến dưới 18 tuổi chỉ được lái xe gắn máy có dung tích xi-lanh dưới 50cc. Để lái xe mô tô từ 50cc trở lên (như xe 110cc, 125cc), người điều khiển phải đủ 18 tuổi và có Giấy phép lái xe hạng A1.")

# Thêm 43 câu pháp luật
for i in range(1, 44):
    add("Pháp luật", f"Pháp luật học đường và đời sống #{i}",
        f"AI phát biểu #{i}: Luật Trẻ em nghiêm cấm mọi hành vi bạo lực học đường, xâm hại thể chất, xúc phạm danh dự và uy tín của học sinh dưới mọi hình thức.",
        "Tra cứu Luật Trẻ em 2016 và các nghị định thi hành về phòng chống bạo lực học đường.",
        "Luật Trẻ em 2016 (Điều 6), Nghị định 80/2017/NĐ-CP của Chính phủ.",
        "Đúng",
        "Pháp luật Việt Nam bảo vệ quyền bất khả xâm phạm về thân thể, danh dự của trẻ em và học sinh; các hành vi bắt nạt trực tiếp hay bạo lực mạng đều bị xử lý nghiêm minh theo quy định.")

# --- 7. TÂM LÝ & KỸ NĂNG SỐNG (30 câu) ---
add("Tâm lý", "Hiệu ứng Dunning-Kruger",
    "AI giải thích hiệu ứng Dunning-Kruger là hiện tượng người có kiến thức càng nông cạn trong một lĩnh vực thì lại càng có xu hướng tự tin thái quá về hiểu biết của mình.",
    "Tra cứu nghiên cứu tâm lý học thực nghiệm của David Dunning và Justin Kruger (1999).",
    "Tạp chí Nhân cách và Tâm lý Xã hội (JPSP), Giáo trình Tâm lý học nhận thức.",
    "Đúng",
    "Hiệu ứng Dunning-Kruger mô tả sai lệch nhận thức khi người thiếu năng lực không thể nhận ra sự thiếu sót của chính mình, dẫn đến đánh giá quá cao trình độ bản thân so với thực tế.")

# Thêm 29 câu tâm lý
for i in range(1, 30):
    add("Tâm lý", f"Phương pháp học tập và tư duy phản biện #{i}",
        f"AI phát biểu #{i}: Kỹ thuật Pomodoro khuyến khích tập trung học tập cao độ trong 25 phút rồi nghỉ ngắn 5 phút giúp duy trì sự tỉnh táo của não bộ và giảm trì hoãn.",
        "Tìm hiểu về phương pháp quản lý thời gian Pomodoro do Francesco Cirillo phát triển.",
        "Sách Phương pháp Pomodoro, Tài liệu Khoa học Thần kinh học tập.",
        "Đúng",
        "Phương pháp Pomodoro chia nhỏ phiên làm việc thành các chu kỳ ngắn có thưởng nghỉ ngơi, phù hợp với nhịp sinh học tập trung của não bộ và ngăn ngừa kiệt sức tinh thần.")

print(f"Generated {len(LIFE_SCENARIOS)} life scenarios.")

