(() => {
  const status = document.getElementById("formSummaryStatus");
  const total = document.getElementById("formResponseTotal");
  const container = document.getElementById("formQuestionStats");
  if (!total || !container) return;

  const endpoint = window.AICheckFormSummaryUrl;
  const refreshInterval = 30000;
  let requestPending = false;
  let liveLoaded = false;
  let isSurveyExpanded = false;

  // ==========================================================================
  // 1. DANH MỤC CÂU HỎI CHUẨN TRÙNG KHỚP 100% VỚI GOOGLE FORM (KÈM NHÃN PHẦN)
  // https://docs.google.com/forms/d/e/1FAIpQLSe-9XkwWqI1ObQ-u-FT-DvFFzbUE2sjyr-XgI9j1rChLuCNKA/viewform
  // ==========================================================================
  const CANONICAL_QUESTIONS = [
    // --- PHẦN 1: THÔNG TIN CHUNG ---
    {
      key: "khoi_lop",
      tag: "PHẦN 1: THÔNG TIN CHUNG",
      match: /khối lớp của bạn/i,
      title: "Khối lớp của bạn",
      isPrivateIfFreeText: true,
      defaultOptions: ["Khối 10", "Khối 11", "Khối 12"]
    },
    {
      key: "mon_hoc",
      tag: "PHẦN 1: THÔNG TIN CHUNG",
      match: /sử dụng ai trong những môn nào/i,
      title: "Bạn sử dụng AI trong những môn nào",
      multiSelect: true,
      defaultOptions: ["TOÁN", "NGỮ VĂN", "TIẾNG ANH", "LỊCH SỬ", "ĐỊA LÍ", "HÓA HỌC", "SINH HỌC", "VẬT LÍ"]
    },
    {
      key: "tan_suat",
      tag: "PHẦN 1: THÔNG TIN CHUNG",
      match: /tần suất bạn sử dụng/i,
      title: "Tần suất bạn sử dụng các công cụ AI (ChatGPT, Claude, Gemini, Copilot...) phục vụ học tập là bao nhiêu?",
      defaultOptions: ["Hằng ngày", "2-3 lần/tuần", "Hiếm khi", "Chưa từng sử dụng"]
    },
    {
      key: "muc_dich",
      tag: "PHẦN 1: THÔNG TIN CHUNG",
      match: /mục đích nào/i,
      title: "Bạn thường dùng AI vào mục đích nào ?",
      multiSelect: true,
      defaultOptions: [
        "Tìm kiếm thông tin, định nghĩa, kiến thức chung",
        "Viết dàn ý / Đoạn văn / Bài văn mẫu (Văn học, Lịch sử...)",
        "Giải bài tập (Toán, Lí, Hóa, Anh...)",
        "Dịch thuật",
        "học ngoại ngữ",
        "tám chuyện"
      ]
    },

    // --- PHẦN 2: KIẾN THỨC NỀN TẢNG VỀ AI VÀ THỰC TRẠNG KIỂM CHỨNG ---
    {
      key: "ao_giac",
      tag: "PHẦN 2: KIẾN THỨC NỀN TẢNG",
      match: /hiện tượng ai tạo ra thông tin hư cấu|ai ảo giác/i,
      title: "Theo bạn, hiện tượng AI tạo ra thông tin hư cấu/sai lệch nhưng trình bày rất thuyết phục được gọi là gì?",
      defaultOptions: [
        "AI ảo giác (AI Hallucination)",
        "AI quá tải (AI Overloading)",
        "AI thiên vị (AI Bias)",
        "AI suy thoái (AI Degradation)"
      ]
    },
    {
      key: "do_tin_cay",
      tag: "PHẦN 2: THÁI ĐỘ & ĐỘ TIN CẬY",
      match: /độ tin cậy bạn dành cho thông tin/i,
      title: "Khi sử dụng câu trả lời từ các công cụ AI phổ biến hiện nay, độ tin cậy bạn dành cho thông tin đó là bao nhiêu?",
      defaultOptions: [
        "Tin tưởng hoàn toàn (100%), không cần kiểm tra lại",
        "Tin tưởng phần lớn (70 - 90%), chỉ kiểm tra nếu thấy nghi ngờ",
        "Đặt nghi vấn (50%), luôn kiểm tra lại các chi tiết quan trọng",
        "Xem là tham khảo sơ bộ, kiểm tra lại toàn bộ từ nguồn chính thống"
      ]
    },
    {
      key: "du_lieu_thien_lech",
      tag: "PHẦN 2: KIẾN THỨC NỀN TẢNG",
      match: /dữ liệu huấn luyện của ai có thể bị lỗi thời/i,
      title: "Dữ liệu huấn luyện của AI có thể bị lỗi thời hoặc mang tính thiên lệch (bias) tùy thuộc vào nguồn dữ liệu.",
      defaultOptions: ["Đúng", "Sai", "Không rõ"]
    },
    {
      key: "sai_lech_viet_nam",
      tag: "PHẦN 2: RỦI RO THÔNG TIN",
      match: /dữ liệu lịch sử hoặc số liệu thống kê cụ thể của việt nam/i,
      title: "Khi hỏi AI về các dữ liệu lịch sử hoặc số liệu thống kê cụ thể của Việt Nam, khả năng xuất hiện sai lệch là:",
      defaultOptions: [
        "Khá cao, do nguồn dữ liệu tiếng Việt và dữ liệu địa phương có thể hạn chế",
        "Rất thấp, vì AI thông minh hơn con người",
        "Không bao giờ sai nếu dùng các bản AI trả phí"
      ]
    },
    {
      key: "doi_chieu_sgk",
      tag: "PHẦN 2: THÓI QUEN KIỂM CHỨNG",
      match: /thường xuyên đối chiếu với sgk/i,
      title: "Khi bạn nhận được một kết quả từ AI, bạn có thường xuyên đối chiếu với SGK hoặc các website chính thống không?",
      defaultOptions: ["Luôn luôn", "Thường xuyên", "Thỉnh thoảng", "Không bao giờ"]
    },
    {
      key: "ly_do_khong_kiem_chung",
      tag: "PHẦN 2: RÀO CẢN HÀNH VI",
      match: /lý do chính khiến bạn không kiểm chứng/i,
      title: "Lý do chính khiến bạn KHÔNG kiểm chứng thông tin từ AI là gì?",
      defaultOptions: [
        "Tin tưởng tuyệt đối vào độ chính xác của AI",
        "Lười / Tốn thời gian",
        "Không biết cách kiểm chứng như thế nào",
        "Thấy thông tin có vẻ hợp lý nên không nghĩ đến việc kiểm chứng"
      ]
    },
    {
      key: "da_tung_nop_bai_sai",
      tag: "PHẦN 2: RỦI RO THỰC TẾ",
      match: /đã bao giờ nộp bài tập hoặc chia sẻ thông tin/i,
      title: "Bạn đã bao giờ nộp bài tập hoặc chia sẻ thông tin lấy từ AI mà sau đó phát hiện ra thông tin đó bị sai chưa?",
      defaultOptions: [
        "Đã từng nhiều lần",
        "Đã từng 1-2 lần",
        "Chưa từng",
        "Không chú ý nên không biết"
      ]
    },
    {
      key: "yeu_to_nham_tuong",
      tag: "PHẦN 2: TÂM LÝ NGƯỜI DÙNG",
      match: /yếu tố nào dưới đây của ai dễ khiến người dùng nhầm tưởng/i,
      title: "Yếu tố nào dưới đây của AI dễ khiến người dùng nhầm tưởng câu trả lời của nó luôn đúng?",
      defaultOptions: [
        "Tất cả các ý trên",
        "Giọng văn tự tin, logic, cấu trúc câu mạch lạc",
        "Tốc độ phản hồi cực nhanh",
        "Dùng nhiều từ ngữ chuyên ngành"
      ]
    },
    {
      key: "fact_checking",
      tag: "PHẦN 2: KIẾN THỨC NỀN TẢNG",
      match: /khái niệm "fact-checking"|kiểm chứng thông tin/i,
      title: "Bạn đã từng nghe đến khái niệm \"Fact-checking\" (Kiểm chứng thông tin) trước đây chưa?",
      defaultOptions: ["Đã nghe nhưng chưa hiểu rõ cách làm", "Đã nghe và hiểu rõ", "Chưa từng nghe"]
    },
    {
      key: "truong_canh_bao",
      tag: "PHẦN 2: GIÁO DỤC NHÀ TRƯỜNG",
      match: /trường thpt trần hưng đạo hoặc giáo viên của bạn đã từng hướng dẫn/i,
      title: "Trường THPT Trần Hưng Đạo hoặc giáo viên của bạn đã từng hướng dẫn/cảnh báo về rủi ro sai sót khi dùng AI chưa?",
      defaultOptions: [
        "Đã được hướng dẫn cụ thể",
        "Chỉ cảnh báo chung chung, chưa hướng dẫn kỹ năng",
        "Chưa từng nghe đề cập đến"
      ]
    },
    {
      key: "cap_thiet",
      tag: "PHẦN 2: NHU CẦU ĐÀO TẠO",
      match: /nâng cao năng lực kiểm chứng thông tin ai cho học sinh thpt/i,
      title: "Theo bạn, việc nâng cao năng lực kiểm chứng thông tin AI cho học sinh THPT là:",
      defaultOptions: ["Cực kỳ cấp thiết", "Cần thiết nhưng không quá vội", "Không cần thiết, tự học sinh sẽ biết"]
    },
    {
      key: "phuong_phap_kiem_tra",
      tag: "PHẦN 2: KỸ NĂNG THỰC HIỆN",
      match: /phương pháp nào sau đây để kiểm tra lại đáp án của ai/i,
      title: "Bạn thường dùng phương pháp nào sau đây để kiểm tra lại đáp án của AI? (Chọn các phương án bạn áp dụng)",
      multiSelect: true,
      defaultOptions: [
        "Mở Sách giáo khoa / Tài liệu học tập chính thức",
        "Tra cứu Google Search với các từ khóa liên quan",
        "Hỏi lại giáo viên hoặc bạn bè giỏi môn đó",
        "Yêu cầu chính AI đó trích dẫn nguồn (URL / tên sách)",
        "Không dùng phương pháp nào"
      ]
    },

    // --- PHẦN 3: THANG ĐO KỸ NĂNG VÀ TÌNH HUỐNG THỰC HÀNH KIỂM CHỨNG AI ---
    {
      key: "tu_tin_link_gia",
      tag: "PHẦN 3: THANG ĐO KỸ NĂNG",
      match: /trích dẫn\/link web giả mạo/i,
      title: "Đánh giá mức độ tự tin: [Tôi nhận biết được khi nào AI đưa ra trích dẫn/link web giả mạo.]",
      defaultOptions: ["Hoàn toàn không đồng ý", "Không đồng ý", "Phân vân", "Đồng ý", "Hoàn toàn đồng ý"]
    },
    {
      key: "tu_tin_prompt",
      tag: "PHẦN 3: THANG ĐO KỸ NĂNG",
      match: /đặt câu hỏi \(prompt\)|ép ai đưa ra thông tin/i,
      title: "Đánh giá mức độ tự tin: [Tôi biết cách đặt câu hỏi (Prompt) để ép AI đưa ra thông tin có kiểm chứng.]",
      defaultOptions: ["Hoàn toàn không đồng ý", "Không đồng ý", "Phân vân", "Đồng ý", "Hoàn toàn đồng ý"]
    },
    {
      key: "tu_tin_thong_ke",
      tag: "PHẦN 3: THANG ĐO KỸ NĂNG",
      match: /con số thống kê do ai đưa ra/i,
      title: "Đánh giá mức độ tự tin: [Tôi có thói quen nghi ngờ tính chính xác của các con số thống kê do AI đưa ra.]",
      defaultOptions: ["Hoàn toàn không đồng ý", "Không đồng ý", "Phân vân", "Đồng ý", "Hoàn toàn đồng ý"]
    },
    {
      key: "tu_tin_goc_nhin",
      tag: "PHẦN 3: THANG ĐO KỸ NĂNG",
      match: /ý kiến\/góc nhìn.*sự thật khách quan/i,
      title: "Đánh giá mức độ tự tin: [Tôi phân biệt được sự khác nhau giữa \"ý kiến/góc nhìn\" và \"sự thật khách quan\" trong văn bản AI viết.]",
      defaultOptions: ["Hoàn toàn không đồng ý", "Không đồng ý", "Phân vân", "Đồng ý", "Hoàn toàn đồng ý"]
    },
    {
      key: "tu_tin_khong_phu_thuoc",
      tag: "PHẦN 3: THANG ĐO KỸ NĂNG",
      match: /không bị phụ thuộc hoặc thụ động/i,
      title: "Đánh giá mức độ tự tin: [Tôi tự tin mình không bị phụ thuộc hoặc thụ động trước các câu trả lời của AI.]",
      defaultOptions: ["Hoàn toàn không đồng ý", "Không đồng ý", "Phân vân", "Đồng ý", "Hoàn toàn đồng ý"]
    },

    // --- PHẦN 4: TÌNH HUỐNG THỰC HÀNH KIỂM CHỨNG (CÂU 21 - 30) ---
    {
      key: "th1_van_hoc",
      tag: "PHẦN 4: TÌNH HUỐNG THỰC HÀNH",
      match: /sông hương là bản trường ca của rừng già|tác phẩm văn học x/i,
      title: "Tình huống 1: Bạn nhờ AI tóm tắt tác phẩm văn học X. AI trả lời rất chi tiết kèm câu trích dẫn: \"Nói như nhà văn Nguyễn Tuân: 'Sông Hương là bản trường ca của rừng già'...\". Bước xử lý đầu tiên đúng nhất của bạn là gì?",
      defaultOptions: [
        "Kiểm tra lại SGK/văn bản gốc xem câu nói đó là của Nguyễn Tuân hay Hoàng Phủ Ngọc Tường",
        "Copied ngay vào bài làm vì AI đã ghi rõ tên tác giả Nguyễn Tuân",
        "Hỏi AI tiếp: \"Bạn có chắc câu này của Nguyễn Tuân không?\"",
        "Bỏ câu đó đi cho an toàn"
      ]
    },
    {
      key: "th2_toan_hinh",
      tag: "PHẦN 4: TÌNH HUỐNG THỰC HÀNH",
      match: /\(a√3\)\/2|toán hình học không gian/i,
      title: "Tình huống 2: Bạn giải một bài tập Toán hình học không gian. AI đưa ra đáp án là (a√3)/2 với lời giải 5 bước rất chặt chẽ. Bạn nên làm gì?",
      defaultOptions: [
        "Thay số thử lại hoặc tự giải độc lập trên nháp để so sánh kết quả",
        "Tin tưởng đáp án vì lời giải trình bày rõ ràng, mạch lạc",
        "Chép đáp án và lời giải vào vở bài tập ngay",
        "Chụp màn hình gửi cho bạn nhờ chép hộ"
      ]
    },
    {
      key: "th3_link_404",
      tag: "PHẦN 4: TÌNH HUỐNG THỰC HÀNH",
      match: /lichsuvietnam\.gov\.vn|lỗi 404/i,
      title: "Tình huống 3: Khi bạn yêu cầu AI cung cấp trích dẫn nguồn cho một số liệu lịch sử, AI đưa ra một đường link dạng https://lichsuvietnam.gov.vn/article/10293. Nhấp vào link thì bị lỗi 404 (Không tìm thấy trang). Nguyên nhân khả dĩ nhất là gì?",
      defaultOptions: [
        "AI đã tự \"bịa\" ra một URL trông có vẻ giống thật",
        "Trang web đã đổi địa chỉ domain",
        "Mạng internet của bạn bị lag",
        "Trang web lịch sử bị sập đúng lúc bạn truy cập"
      ]
    },
    {
      key: "th4_so_lieu_quang_binh",
      tag: "PHẦN 4: TÌNH HUỐNG THỰC HÀNH",
      match: /quảng bình.*năm 2025|báo cáo địa lý/i,
      title: "Tình huống 4: Bạn cần tìm tài liệu về tình hình kinh tế - xã hội tỉnh Quảng Bình năm 2025 để làm báo cáo Địa lý. AI đưa ra các con số chính xác đến từng chữ số thập phân. Bạn nên đánh giá thông tin này như thế nào?",
      defaultOptions: [
        "Nghi vấn và truy cập Cổng thông tin điện tử/Cục Thống kê tỉnh Quảng Bình để đối chiếu",
        "Hoàn toàn tin tưởng vì số liệu chi tiết chứng tỏ AI có dữ liệu chuẩn",
        "Tin tưởng nếu dùng phiên bản ChatGPT Plus hoặc Gemini Advanced",
        "Dùng ngay không cần suy nghĩ"
      ]
    },
    {
      key: "th5_bay_ai",
      tag: "PHẦN 4: TÌNH HUỐNG THỰC HÀNH",
      match: /mùa thu vàng.*nam cao|phát hiện ra "bẫy" ai ảo giác/i,
      title: "Tình huống 5: Kỹ thuật nào sau đây giúp bạn phát hiện ra \"bẫy\" AI ảo giác khi hỏi về một chủ đề phức tạp?",
      defaultOptions: [
        "Tất cả các cách trên",
        "Đặt câu hỏi bẫy về một nhân vật/sự kiện không có thật (VD: \"Hãy phân tích tác phẩm 'Mùa thu vàng' của Nam Cao\")",
        "Hỏi lại câu hỏi đó 3 lần ở 3 phiên chat khác nhau xem câu trả lời có nhất quán không",
        "Yêu cầu AI chỉ ra các điểm yếu hoặc khả năng sai lệch trong chính câu trả lời của nó"
      ]
    },
    {
      key: "th6_luan_tieng_anh",
      tag: "PHẦN 4: TÌNH HUỐNG THỰC HÀNH",
      match: /bài luận tiếng anh.*c1-c2|từ vựng c1-c2/i,
      title: "Tình huống 6: Bạn viết một bài luận Tiếng Anh bằng AI. AI dùng nhiều từ vựng C1-C2 rất hay. Bạn nên kiểm chứng điều gì trước khi nộp cho giáo viên?",
      defaultOptions: [
        "Kiểm tra xem các từ đó có đúng ngữ cảnh và đúng trình độ/phong cách người viết hay không",
        "Không cần kiểm tra, từ vựng nâng cao luôn giúp điểm cao hơn",
        "Chỉ cần kiểm tra lỗi chính tả",
        "Đổi toàn bộ sang các từ cơ bản A1-A2"
      ]
    },
    {
      key: "th7_thoi_su_sang_nay",
      tag: "PHẦN 4: TÌNH HUỐNG THỰC HÀNH",
      match: /sự kiện thời sự vừa xảy ra sáng nay/i,
      title: "Tình huống 7: Bạn thấy AI đưa ra thông tin khẳng định về một sự kiện thời sự vừa xảy ra sáng nay. Khả năng cao là:",
      defaultOptions: [
        "Thông tin có thể bị sai lệch do mô hình AI cần thời gian xử lý hoặc tổng hợp từ nguồn tin đồn chưa kiểm chứng",
        "AI luôn cập nhật chính xác theo từng phút từng giây",
        "AI lấy thông tin trực tiếp từ vệ tinh nên luôn đúng"
      ]
    },
    {
      key: "th8_nguoi_dung_thong_thai",
      tag: "PHẦN 4: TÌNH HUỐNG THỰC HÀNH",
      match: /người dùng ai thông thái|ai-literate/i,
      title: "Tình huống 8: Để trở thành một \"Người dùng AI thông thái\" (AI-literate), học sinh trường THPT Trần Hưng Đạo cần rèn luyện kỹ năng nào? (Chọn các phương án đúng)",
      multiSelect: true,
      defaultOptions: [
        "Kỹ năng tra cứu nâng cao trên Google (Dùng cú pháp tìm kiếm, chọn nguồn uy tín)",
        "Tư duy phản biện - Luôn đặt câu hỏi \"Liệu thông tin này có đúng không?\"",
        "Kỹ năng đối chiếu đa nguồn",
        "Kỹ năng viết câu lệnh rõ ràng, yêu cầu AI đưa ra lập luận và trích dẫn"
      ]
    },
    {
      key: "th9_sai_sgk",
      tag: "PHẦN 4: TÌNH HUỐNG THỰC HÀNH",
      match: /trả lời sai một kiến thức trong sách giáo khoa/i,
      title: "Tình huống 9: Khi phát hiện AI trả lời sai một kiến thức trong Sách giáo khoa, hành động đúng đắn nhất là gì?",
      defaultOptions: [
        "Phản hồi lại cho AI biết điểm sai kèm bằng chứng để AI sửa đổi",
        "Tiếp tục dùng và lờ đi sai sót đó",
        "Xóa ứng dụng AI đó ngay lập tức",
        "Đăng bài phốt AI lên mạng xã hội"
      ]
    }
  ];

  // ==========================================================================
  // 2. BỘ DỮ LIỆU CƠ SỞ (ĐỒNG BỘ SẴN TỪ 12 PHẢN HỒI THỰC TẾ)
  // ==========================================================================
  const BASELINE_SURVEY_DATA = {
    totalResponses: 12,
    updatedAt: new Date().toISOString(),
    questions: [
      {
        title: "Khối lớp của bạn",
        responseCount: 12,
        multiSelect: false,
        options: [
          { label: "Khối 11", count: 7, percentage: 58.3 },
          { label: "Khối 12", count: 4, percentage: 33.3 },
          { label: "Khối 10", count: 1, percentage: 8.4 }
        ]
      },
      {
        title: "Bạn sử dụng AI trong những môn nào",
        responseCount: 12,
        multiSelect: true,
        options: [
          { label: "TIẾNG ANH", count: 9, percentage: 75.0 },
          { label: "TOÁN", count: 8, percentage: 66.7 },
          { label: "NGỮ VĂN", count: 7, percentage: 58.3 },
          { label: "VẬT LÍ", count: 5, percentage: 41.7 },
          { label: "HÓA HỌC", count: 5, percentage: 41.7 },
          { label: "LỊCH SỬ", count: 4, percentage: 33.3 },
          { label: "SINH HỌC", count: 3, percentage: 25.0 },
          { label: "ĐỊA LÍ", count: 2, percentage: 16.7 }
        ]
      },
      {
        title: "Tần suất bạn sử dụng các công cụ AI (ChatGPT, Claude, Gemini, Copilot...) phục vụ học tập là bao nhiêu?",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Hằng ngày", count: 7, percentage: 63.6 },
          { label: "2-3 lần/tuần", count: 4, percentage: 36.4 },
          { label: "Hiếm khi", count: 0, percentage: 0 },
          { label: "Chưa từng sử dụng", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Bạn thường dùng AI vào mục đích nào ?",
        responseCount: 11,
        multiSelect: true,
        options: [
          { label: "Tìm kiếm thông tin, định nghĩa, kiến thức chung", count: 6, percentage: 54.5 },
          { label: "Viết dàn ý / Đoạn văn / Bài văn mẫu (Văn học, Lịch sử...)", count: 6, percentage: 54.5 },
          { label: "Giải bài tập (Toán, Lí, Hóa, Anh...)", count: 5, percentage: 45.5 },
          { label: "Dịch thuật", count: 4, percentage: 36.4 },
          { label: "học ngoại ngữ", count: 4, percentage: 36.4 },
          { label: "tám chuyện", count: 1, percentage: 9.1 }
        ]
      },
      {
        title: "Theo bạn, hiện tượng AI tạo ra thông tin hư cấu/sai lệch nhưng trình bày rất thuyết phục được gọi là gì?",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "AI ảo giác (AI Hallucination)", count: 4, percentage: 36.4 },
          { label: "AI suy thoái (AI Degradation)", count: 3, percentage: 27.3 },
          { label: "AI quá tải (AI Overloading)", count: 2, percentage: 18.2 },
          { label: "AI thiên vị (AI Bias)", count: 2, percentage: 18.2 }
        ]
      },
      {
        title: "Khi sử dụng câu trả lời từ các công cụ AI phổ biến hiện nay, độ tin cậy bạn dành cho thông tin đó là bao nhiêu?",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Tin tưởng phần lớn (70 - 90%), chỉ kiểm tra nếu thấy nghi ngờ", count: 6, percentage: 54.5 },
          { label: "Đặt nghi vấn (50%), luôn kiểm tra lại các chi tiết quan trọng", count: 5, percentage: 45.5 },
          { label: "Xem là tham khảo sơ bộ, kiểm tra lại toàn bộ từ nguồn chính thống", count: 0, percentage: 0 },
          { label: "Tin tưởng hoàn toàn (100%), không cần kiểm tra lại", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Dữ liệu huấn luyện của AI có thể bị lỗi thời hoặc mang tính thiên lệch (bias) tùy thuộc vào nguồn dữ liệu.",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Đúng", count: 6, percentage: 54.5 },
          { label: "Không rõ", count: 5, percentage: 45.5 },
          { label: "Sai", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Khi hỏi AI về các dữ liệu lịch sử hoặc số liệu thống kê cụ thể của Việt Nam, khả năng xuất hiện sai lệch là:",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Khá cao, do nguồn dữ liệu tiếng Việt và dữ liệu địa phương có thể hạn chế", count: 8, percentage: 80.0 },
          { label: "Rất thấp, vì AI thông minh hơn con người", count: 2, percentage: 20.0 },
          { label: "Không bao giờ sai nếu dùng các bản AI trả phí", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Khi bạn nhận được một kết quả từ AI, bạn có thường xuyên đối chiếu với SGK hoặc các website chính thống không?",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Thường xuyên", count: 6, percentage: 54.5 },
          { label: "Luôn luôn", count: 4, percentage: 36.4 },
          { label: "Thỉnh thoảng", count: 1, percentage: 9.1 },
          { label: "Không bao giờ", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Lý do chính khiến bạn KHÔNG kiểm chứng thông tin từ AI là gì?",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Thấy thông tin có vẻ hợp lý nên không nghĩ đến việc kiểm chứng", count: 5, percentage: 50.0 },
          { label: "Lười / Tốn thời gian", count: 3, percentage: 30.0 },
          { label: "Tin tưởng tuyệt đối vào độ chính xác của AI", count: 1, percentage: 10.0 },
          { label: "Không biết cách kiểm chứng như thế nào", count: 1, percentage: 10.0 }
        ]
      },
      {
        title: "Bạn đã bao giờ nộp bài tập hoặc chia sẻ thông tin lấy từ AI mà sau đó phát hiện ra thông tin đó bị sai chưa?",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Đã từng 1-2 lần", count: 6, percentage: 54.5 },
          { label: "Chưa từng", count: 3, percentage: 27.3 },
          { label: "Đã từng nhiều lần", count: 1, percentage: 9.1 },
          { label: "Không chú ý nên không biết", count: 1, percentage: 9.1 }
        ]
      },
      {
        title: "Yếu tố nào dưới đây của AI dễ khiến người dùng nhầm tưởng câu trả lời của nó luôn đúng?",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Tất cả các ý trên", count: 7, percentage: 63.6 },
          { label: "Giọng văn tự tin, logic, cấu trúc câu mạch lạc", count: 3, percentage: 27.3 },
          { label: "Tốc độ phản hồi cực nhanh", count: 1, percentage: 9.1 },
          { label: "Dùng nhiều từ ngữ chuyên ngành", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Bạn đã từng nghe đến khái niệm \"Fact-checking\" (Kiểm chứng thông tin) trước đây chưa?",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Đã nghe nhưng chưa hiểu rõ cách làm", count: 7, percentage: 63.6 },
          { label: "Đã nghe và hiểu rõ", count: 3, percentage: 27.3 },
          { label: "Chưa từng nghe", count: 1, percentage: 9.1 }
        ]
      },
      {
        title: "Trường THPT Trần Hưng Đạo hoặc giáo viên của bạn đã từng hướng dẫn/cảnh báo về rủi ro sai sót khi dùng AI chưa?",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Đã được hướng dẫn cụ thể", count: 10, percentage: 90.9 },
          { label: "Chỉ cảnh báo chung chung, chưa hướng dẫn kỹ năng", count: 1, percentage: 9.1 },
          { label: "Chưa từng nghe đề cập đến", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Theo bạn, việc nâng cao năng lực kiểm chứng thông tin AI cho học sinh THPT là:",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Cực kỳ cấp thiết", count: 7, percentage: 63.6 },
          { label: "Cần thiết nhưng không quá vội", count: 4, percentage: 36.4 },
          { label: "Không cần thiết, tự học sinh sẽ biết", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Bạn thường dùng phương pháp nào sau đây để kiểm tra lại đáp án của AI? (Chọn các phương án bạn áp dụng)",
        responseCount: 11,
        multiSelect: true,
        options: [
          { label: "Mở Sách giáo khoa / Tài liệu học tập chính thức", count: 11, percentage: 100 },
          { label: "Tra cứu Google Search với các từ khóa liên quan", count: 9, percentage: 81.8 },
          { label: "Hỏi lại giáo viên hoặc bạn bè giỏi môn đó", count: 4, percentage: 36.4 },
          { label: "Yêu cầu chính AI đó trích dẫn nguồn (URL / tên sách)", count: 4, percentage: 36.4 },
          { label: "Không dùng phương pháp nào", count: 1, percentage: 9.1 }
        ]
      },
      {
        title: "Đánh giá mức độ tự tin: [Tôi nhận biết được khi nào AI đưa ra trích dẫn/link web giả mạo.]",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Đồng ý", count: 6, percentage: 54.5 },
          { label: "Phân vân", count: 4, percentage: 36.4 },
          { label: "Hoàn toàn đồng ý", count: 1, percentage: 9.1 },
          { label: "Không đồng ý", count: 0, percentage: 0 },
          { label: "Hoàn toàn không đồng ý", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Đánh giá mức độ tự tin: [Tôi biết cách đặt câu hỏi (Prompt) để ép AI đưa ra thông tin có kiểm chứng.]",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Đồng ý", count: 7, percentage: 63.6 },
          { label: "Hoàn toàn đồng ý", count: 2, percentage: 18.2 },
          { label: "Phân vân", count: 2, percentage: 18.2 },
          { label: "Không đồng ý", count: 0, percentage: 0 },
          { label: "Hoàn toàn không đồng ý", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Đánh giá mức độ tự tin: [Tôi có thói quen nghi ngờ tính chính xác của các con số thống kê do AI đưa ra.]",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Đồng ý", count: 8, percentage: 80.0 },
          { label: "Hoàn toàn đồng ý", count: 1, percentage: 10.0 },
          { label: "Phân vân", count: 1, percentage: 10.0 },
          { label: "Không đồng ý", count: 0, percentage: 0 },
          { label: "Hoàn toàn không đồng ý", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Đánh giá mức độ tự tin: [Tôi phân biệt được sự khác nhau giữa \"ý kiến/góc nhìn\" và \"sự thật khách quan\" trong văn bản AI viết.]",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Đồng ý", count: 6, percentage: 60.0 },
          { label: "Phân vân", count: 3, percentage: 30.0 },
          { label: "Hoàn toàn đồng ý", count: 1, percentage: 10.0 },
          { label: "Không đồng ý", count: 0, percentage: 0 },
          { label: "Hoàn toàn không đồng ý", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Đánh giá mức độ tự tin: [Tôi tự tin mình không bị phụ thuộc hoặc thụ động trước các câu trả lời của AI.]",
        responseCount: 11,
        multiSelect: false,
        options: [
          { label: "Phân vân", count: 6, percentage: 54.5 },
          { label: "Đồng ý", count: 4, percentage: 36.4 },
          { label: "Không đồng ý", count: 1, percentage: 9.1 },
          { label: "Hoàn toàn không đồng ý", count: 0, percentage: 0 },
          { label: "Hoàn toàn đồng ý", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Tình huống 1: Bạn nhờ AI tóm tắt tác phẩm văn học X. AI trả lời rất chi tiết kèm câu trích dẫn: \"Nói như nhà văn Nguyễn Tuân: 'Sông Hương là bản trường ca của rừng già'...\". Bước xử lý đầu tiên đúng nhất của bạn là gì?",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Kiểm tra lại SGK/văn bản gốc xem câu nói đó là của Nguyễn Tuân hay Hoàng Phủ Ngọc Tường", count: 10, percentage: 100 },
          { label: "Copied ngay vào bài làm vì AI đã ghi rõ tên tác giả Nguyễn Tuân", count: 0, percentage: 0 },
          { label: "Hỏi AI tiếp: \"Bạn có chắc câu này của Nguyễn Tuân không?\"", count: 0, percentage: 0 },
          { label: "Bỏ câu đó đi cho an toàn", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Tình huống 2: Bạn giải một bài tập Toán hình học không gian. AI đưa ra đáp án là (a√3)/2 với lời giải 5 bước rất chặt chẽ. Bạn nên làm gì?",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Thay số thử lại hoặc tự giải độc lập trên nháp để so sánh kết quả", count: 8, percentage: 80 },
          { label: "Chụp màn hình gửi cho bạn nhờ chép hộ", count: 1, percentage: 10 },
          { label: "Tin tưởng đáp án vì lời giải trình bày rõ ràng, mạch lạc", count: 1, percentage: 10 },
          { label: "Chép đáp án và lời giải vào vở bài tập ngay", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Tình huống 3: Khi bạn yêu cầu AI cung cấp trích dẫn nguồn cho một số liệu lịch sử, AI đưa ra một đường link dạng https://lichsuvietnam.gov.vn/article/10293. Nhấp vào link thì bị lỗi 404 (Không tìm thấy trang). Nguyên nhân khả dĩ nhất là gì?",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "AI đã tự \"bịa\" ra một URL trông có vẻ giống thật", count: 5, percentage: 50 },
          { label: "Trang web đã đổi địa chỉ domain", count: 3, percentage: 30 },
          { label: "Mạng internet của bạn bị lag", count: 1, percentage: 10 },
          { label: "Trang web lịch sử bị sập đúng lúc bạn truy cập", count: 1, percentage: 10 }
        ]
      },
      {
        title: "Tình huống 4: Bạn cần tìm tài liệu về tình hình kinh tế - xã hội tỉnh Quảng Bình năm 2025 để làm báo cáo Địa lý. AI đưa ra các con số chính xác đến từng chữ số thập phân. Bạn nên đánh giá thông tin này như thế nào?",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Nghi vấn và truy cập Cổng thông tin điện tử/Cục Thống kê tỉnh Quảng Bình để đối chiếu", count: 10, percentage: 100 },
          { label: "Hoàn toàn tin tưởng vì số liệu chi tiết chứng tỏ AI có dữ liệu chuẩn", count: 0, percentage: 0 },
          { label: "Tin tưởng nếu dùng phiên bản ChatGPT Plus hoặc Gemini Advanced", count: 0, percentage: 0 },
          { label: "Dùng ngay không cần suy nghĩ", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Tình huống 5: Kỹ thuật nào sau đây giúp bạn phát hiện ra \"bẫy\" AI ảo giác khi hỏi về một chủ đề phức tạp?",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Đặt câu hỏi bẫy về một nhân vật/sự kiện không có thật (VD: \"Hãy phân tích tác phẩm 'Mùa thu vàng' của Nam Cao\")", count: 5, percentage: 50 },
          { label: "Hỏi lại câu hỏi đó 3 lần ở 3 phiên chat khác nhau xem câu trả lời có nhất quán không", count: 3, percentage: 30 },
          { label: "Tất cả các cách trên", count: 2, percentage: 20 },
          { label: "Yêu cầu AI chỉ ra các điểm yếu hoặc khả năng sai lệch trong chính câu trả lời của nó", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Tình huống 6: Bạn viết một bài luận Tiếng Anh bằng AI. AI dùng nhiều từ vựng C1-C2 rất hay. Bạn nên kiểm chứng điều gì trước khi nộp cho giáo viên?",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Kiểm tra xem các từ đó có đúng ngữ cảnh và đúng trình độ/phong cách người viết hay không", count: 9, percentage: 90 },
          { label: "Không cần kiểm tra, từ vựng nâng cao luôn giúp điểm cao hơn", count: 1, percentage: 10 },
          { label: "Chỉ cần kiểm tra lỗi chính tả", count: 0, percentage: 0 },
          { label: "Đổi toàn bộ sang các từ cơ bản A1-A2", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Tình huống 7: Bạn thấy AI đưa ra thông tin khẳng định về một sự kiện thời sự vừa xảy ra sáng nay. Khả năng cao là:",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Thông tin có thể bị sai lệch do mô hình AI cần thời gian xử lý hoặc tổng hợp từ nguồn tin đồn chưa kiểm chứng", count: 8, percentage: 80 },
          { label: "AI luôn cập nhật chính xác theo từng phút từng giây", count: 2, percentage: 20 },
          { label: "AI lấy thông tin trực tiếp từ vệ tinh nên luôn đúng", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Tình huống 8: Để trở thành một \"Người dùng AI thông thái\" (AI-literate), học sinh trường THPT Trần Hưng Đạo cần rèn luyện kỹ năng nào? (Chọn các phương án đúng)",
        responseCount: 10,
        multiSelect: true,
        options: [
          { label: "Kỹ năng tra cứu nâng cao trên Google (Dùng cú pháp tìm kiếm, chọn nguồn uy tín)", count: 5, percentage: 50 },
          { label: "Tư duy phản biện - Luôn đặt câu hỏi \"Liệu thông tin này có đúng không?\"", count: 4, percentage: 40 },
          { label: "Kỹ năng đối chiếu đa nguồn", count: 1, percentage: 10 },
          { label: "Kỹ năng viết câu lệnh rõ ràng, yêu cầu AI đưa ra lập luận và trích dẫn", count: 0, percentage: 0 }
        ]
      },
      {
        title: "Tình huống 9: Khi phát hiện AI trả lời sai một kiến thức trong Sách giáo khoa, hành động đúng đắn nhất là gì?",
        responseCount: 10,
        multiSelect: false,
        options: [
          { label: "Phản hồi lại cho AI biết điểm sai kèm bằng chứng để AI sửa đổi", count: 9, percentage: 90 },
          { label: "Tiếp tục dùng và lờ đi sai sót đó", count: 1, percentage: 10 },
          { label: "Xóa ứng dụng AI đó ngay lập tức", count: 0, percentage: 0 },
          { label: "Đăng bài phốt AI lên mạng xã hội", count: 0, percentage: 0 }
        ]
      }
    ]
  };

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
  }

  function appendText(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
  }

  // ==========================================================================
  // 3. XỬ LÝ & ĐỒNG BỘ DỮ LIỆU TỔNG HỢP VỚI DANH MỤC CÂU HỎI CHUẨN
  // ==========================================================================
  function isExcludedTitle(title) {
    if (!title) return true;
    return /^cột\s*\d+$|^phần\s*\d+$|dấu thời gian|timestamp|họ và tên|bạn tên|tên bạn|chi đoàn|lớp nào|ý kiến|giải pháp/i.test(title);
  }

  function processSummaryQuestions(liveQuestions) {
    const validLive = Array.isArray(liveQuestions) ? liveQuestions.filter(q => q && q.title && !isExcludedTitle(q.title)) : [];
    const usedLive = new Set();
    const result = [];

    // Duyệt qua từng câu hỏi trong danh mục chuẩn theo đúng thứ tự Google Form
    CANONICAL_QUESTIONS.forEach((canon) => {
      // Tìm câu hỏi trong live response khớp với câu chuẩn
      const matchedLive = validLive.find((lq) => !usedLive.has(lq) && canon.match.test(lq.title));

      if (matchedLive) {
        usedLive.add(matchedLive);

        // Bảo vệ quyền riêng tư nếu dữ liệu câu trả lời là danh sách tên riêng
        if (canon.isPrivateIfFreeText && matchedLive.options) {
          const labels = matchedLive.options.map(o => o.label || "");
          const isNameList = labels.some(l => /12a\d|11a\d|10a\d|lớp\s*1/i.test(l)) ||
            (labels.length >= 3 && matchedLive.options.every(o => o.count === 1));
          if (isNameList) {
            // Dùng baseline an toàn thay vì hiển thị tên học sinh
            const baseQ = BASELINE_SURVEY_DATA.questions.find(bq => canon.match.test(bq.title));
            if (baseQ) {
              result.push({
                title: canon.title,
                tag: canon.tag,
                responseCount: baseQ.responseCount,
                multiSelect: Boolean(canon.multiSelect),
                options: baseQ.options
              });
            }
            return;
          }
        }

        // Tạo map đếm phương án từ live data
        const liveCounts = new Map();
        (matchedLive.options || []).forEach(opt => {
          liveCounts.set(opt.label.trim(), opt.count);
        });

        // Xây dựng danh sách phương án đầy đủ theo chuẩn Google Form
        const finalOptions = [];
        const seenLabels = new Set();

        (canon.defaultOptions || []).forEach((defLabel) => {
          const normDef = defLabel.trim();
          seenLabels.add(normDef);
          // Tìm count khớp trực tiếp hoặc mờ
          let count = 0;
          for (const [lLabel, lCount] of liveCounts.entries()) {
            if (lLabel === normDef || lLabel.toLowerCase() === normDef.toLowerCase() ||
                (normDef.length > 25 && lLabel.includes(normDef.slice(0, 25)))) {
              count = Math.max(count, lCount);
            }
          }
          finalOptions.push({
            label: defLabel,
            count,
            percentage: matchedLive.responseCount ? Math.round((count / matchedLive.responseCount) * 1000) / 10 : 0
          });
        });

        // Bổ sung các phương án viết tay hợp lệ khác (nếu người dùng nhập vào "Khác")
        liveCounts.forEach((count, label) => {
          if (!seenLabels.has(label) && count > 0 && !label.startsWith("Khác (nội dung")) {
            finalOptions.push({
              label,
              count,
              percentage: matchedLive.responseCount ? Math.round((count / matchedLive.responseCount) * 1000) / 10 : 0
            });
          }
        });

        finalOptions.sort((a, b) => b.count - a.count);

        result.push({
          title: canon.title,
          tag: canon.tag,
          responseCount: matchedLive.responseCount || 0,
          multiSelect: Boolean(canon.multiSelect || matchedLive.multiSelect),
          options: finalOptions
        });
      } else {
        // Nếu câu hỏi chưa có trong live sheet (mới thêm vào form hoặc chưa ai trả lời), hiển thị từ baseline hoặc mặc định
        const baseQ = BASELINE_SURVEY_DATA.questions.find(bq => canon.match.test(bq.title));
        if (baseQ) {
          result.push({
            title: canon.title,
            tag: canon.tag,
            responseCount: baseQ.responseCount,
            multiSelect: Boolean(canon.multiSelect),
            options: baseQ.options
          });
        } else {
          result.push({
            title: canon.title,
            tag: canon.tag,
            responseCount: 0,
            multiSelect: Boolean(canon.multiSelect),
            options: (canon.defaultOptions || []).map(opt => ({ label: opt, count: 0, percentage: 0 }))
          });
        }
      }
    });

    return result;
  }

  // ==========================================================================
  // 4. RENDER GIAO DIỆN THẺ CÂU HỎI & BIỂU ĐỒ TỶ LỆ
  // ==========================================================================
  function renderQuestion(question) {
    const card = document.createElement("article");
    card.className = "forms-question-card";

    // Tag phân loại lĩnh vực / phần khảo sát
    if (question.tag) {
      const tag = document.createElement("span");
      tag.className = "forms-question-tag";
      tag.textContent = question.tag;
      card.append(tag);
    }

    appendText(card, "h3", "forms-question-title", question.title);
    appendText(
      card,
      "p",
      "forms-question-meta",
      `${question.responseCount} câu trả lời${question.multiSelect ? " · có thể chọn nhiều" : ""}`
    );

    const options = document.createElement("ul");
    options.className = "forms-option-list";
    card.append(options);

    question.options.forEach((option) => {
      const item = document.createElement("li");
      item.className = "forms-option";

      const labels = document.createElement("div");
      labels.className = "forms-option-labels";
      appendText(labels, "span", "forms-option-name", option.label);
      appendText(labels, "strong", "forms-option-value", `${option.count} · ${option.percentage}%`);
      item.append(labels);

      const track = document.createElement("div");
      track.className = "forms-option-track";
      track.setAttribute("aria-hidden", "true");
      const fill = document.createElement("span");
      fill.style.width = `${Math.max(0, Math.min(100, option.percentage))}%`;
      track.append(fill);
      item.append(track);
      options.append(item);
    });

    if (!question.options.length) {
      appendText(card, "p", "forms-question-empty", "Chưa có dữ liệu phản hồi cho câu hỏi này.");
    }

    return card;
  }

  function renderSummary(summary, isBaseline = false) {
    if (summary.error) {
      if (!liveLoaded) {
        setStatus("Đang hiển thị dữ liệu khảo sát. Đang đồng bộ cập nhật từ Google Sheets...", false);
        return;
      }
      throw new Error(summary.error);
    }
    if (!Array.isArray(summary.questions) || !Number.isFinite(Number(summary.totalResponses))) {
      if (!liveLoaded) return;
      throw new Error("Dữ liệu tổng hợp trả về không đúng định dạng.");
    }

    if (!isBaseline) {
      liveLoaded = true;
    }

    total.textContent = Number(summary.totalResponses).toLocaleString("vi-VN");

    // Xử lý chuẩn hóa và sắp xếp lại toàn bộ câu hỏi theo đúng danh mục Google Form
    const cleanQuestions = processSummaryQuestions(summary.questions);
    const INITIAL_VISIBLE_COUNT = 3;
    const questionCards = cleanQuestions.map((q, idx) => {
      const card = renderQuestion(q);
      card.dataset.index = String(idx);
      if (idx >= INITIAL_VISIBLE_COUNT && !isSurveyExpanded) {
        card.style.display = "none";
      }
      return card;
    });

    if (cleanQuestions.length > INITIAL_VISIBLE_COUNT) {
      const remainingCount = cleanQuestions.length - INITIAL_VISIBLE_COUNT;
      const toggleWrap = document.createElement("div");
      toggleWrap.className = "forms-expand-wrap";
      toggleWrap.style.cssText = "grid-column: 1 / -1; display: flex; justify-content: center; margin: 24px 0 14px;";

      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "forms-toggle-btn";
      toggleBtn.id = "formsToggleQuestionsBtn";

      const updateBtnContent = () => {
        if (isSurveyExpanded) {
          toggleBtn.innerHTML = `<span class="toggle-icon">−</span> Thu gọn bớt câu hỏi khảo sát`;
          toggleBtn.setAttribute("aria-expanded", "true");
        } else {
          toggleBtn.innerHTML = `<span class="toggle-icon">+</span> Xem thêm ${remainingCount} câu hỏi khảo sát khác`;
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      };

      updateBtnContent();

      toggleBtn.addEventListener("click", () => {
        isSurveyExpanded = !isSurveyExpanded;
        window.AICheckAudio?.playClick?.();
        questionCards.forEach((c, idx) => {
          if (idx >= INITIAL_VISIBLE_COUNT) {
            if (isSurveyExpanded) {
              c.style.display = "";
              c.style.animation = "card-entrance 0.35s ease-out both";
            } else {
              c.style.display = "none";
            }
          }
        });
        updateBtnContent();
        if (!isSurveyExpanded) {
          const firstTarget = questionCards[INITIAL_VISIBLE_COUNT - 1];
          if (firstTarget) {
            firstTarget.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      });

      toggleWrap.append(toggleBtn);
      container.replaceChildren(...questionCards, toggleWrap);
    } else {
      container.replaceChildren(...questionCards);
    }

    const updatedAt = summary.updatedAt ? new Date(summary.updatedAt) : null;
    const updatedText = updatedAt && !Number.isNaN(updatedAt.valueOf())
      ? ` · cập nhật ${updatedAt.toLocaleTimeString("vi-VN")}`
      : "";

    if (isBaseline) {
      setStatus(
        `Đã tải thống kê khảo sát (${cleanQuestions.length} câu hỏi)${updatedText}. Đang đồng bộ tự động với Google Sheets...`,
        false
      );
    } else {
      setStatus(
        `Đã tải thống kê trực tiếp từ Google Sheets (${cleanQuestions.length} câu hỏi)${updatedText}. Tự động làm mới mỗi 30 giây.`,
        false
      );
    }
  }

  function loadSummary() {
    if (requestPending) return;
    requestPending = true;

    const callbackName = `receiveAICheckForms_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      finish();
      if (!liveLoaded) {
        setStatus("Đang hiển thị dữ liệu khảo sát. Đang kết nối làm mới từ Google Sheets...", false);
      } else {
        setStatus("Hết thời gian chờ Apps Script. Đang tự thử lại sau 30 giây...", false);
      }
    }, 15000);

    function finish() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
      requestPending = false;
    }

    window[callbackName] = (summary) => {
      finish();
      try {
        renderSummary(summary, false);
      } catch (error) {
        if (!liveLoaded) {
          setStatus("Đang hiển thị dữ liệu khảo sát. Đang kết nối làm mới từ Google Sheets...", false);
        } else {
          setStatus(`Không thể hiển thị thống kê: ${error.message}`, true);
        }
      }
    };

    script.onerror = () => {
      finish();
      if (!liveLoaded) {
        setStatus("Đang hiển thị dữ liệu khảo sát. Đang kết nối làm mới từ Google Sheets...", false);
      } else {
        setStatus("Không tải được Apps Script. Đang tự thử lại sau 30 giây...", false);
      }
    };

    const requestUrl = new URL(endpoint);
    requestUrl.searchParams.set("callback", callbackName);
    requestUrl.searchParams.set("_", String(Date.now()));
    script.src = requestUrl.href;
    document.head.append(script);
  }

  // ==========================================================================
  // 5. KHỞI CHẠY TỨC THÌ
  // ==========================================================================
  // Nạp ngay dữ liệu cơ sở để giao diện không bị giật lag hay trắng trang
  try {
    renderSummary(BASELINE_SURVEY_DATA, true);
  } catch (err) {
    console.warn("Baseline render warning:", err);
  }

  if (!endpoint) {
    setStatus("Đang hiển thị dữ liệu khảo sát thực tế. Thêm URL Web App vào forms-summary-config.js để cập nhật trực tiếp.", false);
    return;
  }

  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.hostname !== "script.google.com") {
      throw new Error("URL phải là địa chỉ Web App HTTPS từ script.google.com.");
    }
    loadSummary();
    window.setInterval(loadSummary, refreshInterval);
  } catch (error) {
    if (!liveLoaded) {
      setStatus("Đang hiển thị dữ liệu khảo sát. Đang kết nối làm mới từ Google Sheets...", false);
    } else {
      setStatus(`Cấu hình Apps Script không hợp lệ: ${error.message}`, true);
    }
  }
})();