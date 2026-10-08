/**
 * AI CHECK THĐ - EXAM STORAGE & QUESTION BANK MODULE
 * Quản lý ngân hàng đề thi, lưu trữ bài làm và đồng bộ vi phạm phòng thi
 */
(() => {
  const EXAM_BANK_KEY = "aicheck:exam_bank";
  const EXAM_RESULTS_KEY = "aicheck:exam_results";

  // Danh sách đề thi mặc định nếu hệ thống chưa có dữ liệu
  const DEFAULT_EXAMS = [
    {
      id: "exam_thd_20",
      title: "Đề kiểm tra Chuẩn hóa Năng lực Kiểm chứng AI (20 câu)",
      description: "Đề thi chính thức 20 câu theo 5 chuẩn năng lực kiểm chứng thông tin AI của học sinh THPT.",
      durationMinutes: 30,
      pointsPerQuestion: 2,
      passingScore: 24, // 20 câu x 2đ = 40đ, yêu cầu tối thiểu 24đ (60%)
      createdAt: "2026-10-07T08:00:00.000Z",
      questions: [
        {
          id: "q1",
          question: "AI đưa ra một con số thống kê rất cụ thể nhưng không dẫn nguồn kiểm chứng. Việc đầu tiên em nên làm là gì?",
          options: [
            "A. Ghi lại như số liệu đã được xác nhận chính thức",
            "B. Đánh dấu con số là khẳng định cần kiểm chứng độc lập",
            "C. Chỉ hỏi lại AI xem con số đó có chính xác hay không",
            "D. Tin tưởng tuyệt đối vì AI xử lý dữ liệu lớn"
          ],
          correctAnswer: 1, // B
          explanation: "Cần khoanh vùng khẳng định cụ thể để tìm nguồn gốc độc lập đối chiếu."
        },
        {
          id: "q2",
          question: "Trong các khẳng định do AI tạo ra sau đây, khẳng định nào cần ưu tiên xác minh trước nhất?",
          options: [
            "A. Khẳng định có thể ảnh hưởng trực tiếp đến sức khỏe hoặc an toàn",
            "B. Khẳng định về một chi tiết phụ ít ảnh hưởng trong bài văn giới thiệu",
            "C. Nhận xét về cách diễn đạt ngôn từ trong một đoạn văn",
            "D. Câu đố vui về lịch sử thế giới"
          ],
          correctAnswer: 0, // A
          explanation: "Thông tin ảnh hưởng đến tính mạng, sức khỏe có mức độ rủi ro cao nhất cần kiểm chứng ngay."
        },
        {
          id: "q3",
          question: "Một câu trả lời AI gồm có số liệu, trích dẫn học giả và kết luận nguyên nhân. Cách xử lý khoa học nhất?",
          options: [
            "A. Kiểm tra một nguồn bất kỳ rồi chấp nhận toàn bộ văn bản",
            "B. Tách từng khẳng định (số liệu, trích dẫn, suy luận) để kiểm tra riêng",
            "C. Mặc định trích dẫn và kết luận đúng, chỉ kiểm tra sơ bộ số liệu",
            "D. Coi tất cả là sai sự thật và xóa bài"
          ],
          correctAnswer: 1, // B
          explanation: "Quy tắc phân tách khẳng định (Claim decomposition) giúp kiểm chứng chuẩn xác từng phần."
        },
        {
          id: "q4",
          question: "AI sử dụng cụm từ 'mọi nghiên cứu đều chứng minh'. Dấu hiệu cảnh báo nào cần đặc biệt lưu tâm?",
          options: [
            "A. Từ mang tính tuyệt đối hóa và phạm vi khái quát quá rộng",
            "B. Dùng từ ngữ trang trọng mang tính học thuật",
            "C. Câu văn quá ngắn gọn, súc tích",
            "D. Đoạn văn không dùng dấu ngoặc kép"
          ],
          correctAnswer: 0, // A
          explanation: "Từ ngữ tuyệt đối hóa (mọi, tất cả, 100%) thường là dấu hiệu của ảo giác hoặc ngụy biện khái quát hóa vội vã."
        },
        {
          id: "q5",
          question: "AI nêu tên một bài báo khoa học và tạp chí xuất bản nhưng không cung cấp đường dẫn. Cách xác minh chuẩn nhất?",
          options: [
            "A. Tra cứu tên bài báo, tác giả, tạp chí và mã số định danh DOI trên Google Scholar/Cơ sở dữ liệu độc lập",
            "B. Tìm kiếm một bài đăng tóm tắt trên mạng xã hội nhắc lại tên bài báo",
            "C. Mặc định đúng vì AI đã nêu tên tạp chí tiếng Anh rất chuyên nghiệp",
            "D. Hỏi một chatbot AI khác để xác nhận"
          ],
          correctAnswer: 0, // A
          explanation: "DOI và hệ thống thư mục khoa học chuẩn là phương pháp xác thực bài báo quốc tế duy nhất có giá trị."
        },
        {
          id: "q6",
          question: "Nguồn thông tin nào có giá trị pháp lý cao nhất để xác minh quy chế thi tốt nghiệp THPT hiện hành?",
          options: [
            "A. Bài phân tích và bình luận trên diễn đàn học sinh",
            "B. Văn bản quy phạm pháp luật chính thức còn hiệu lực do Bộ GD&ĐT ban hành",
            "C. Bài viết tóm tắt của một trang tin tức từ 3 năm trước",
            "D. Video chia sẻ kinh nghiệm học tập trên TikTok"
          ],
          correctAnswer: 1, // B
          explanation: "Văn bản chính thức của cơ quan quản lý nhà nước có hiệu lực pháp lý cao nhất."
        },
        {
          id: "q7",
          question: "Khi truy cập một trang web do AI dẫn chứng, em nhận thấy trang không ghi tên tác giả và không có ngày đăng. Em nên xử lý thế nào?",
          options: [
            "A. Vẫn sử dụng nếu nội dung nghe có vẻ hợp lý và lôi cuốn",
            "B. Thận trọng, kiểm tra thông tin xuất xứ tên miền và tìm nguồn có trách nhiệm pháp lý rõ ràng",
            "C. Sao chép ngay vào bài thuyết trình",
            "D. Xem lượt like và share của trang để quyết định"
          ],
          correctAnswer: 1, // B
          explanation: "Thiếu tác giả và thời điểm xuất bản làm giảm nghiêm trọng tính minh bạch và độ tin cậy của nguồn."
        },
        {
          id: "q8",
          question: "AI cung cấp một đường link (URL) nguồn tham khảo, nhưng khi bấm vào thì trang web báo lỗi 404 (Không tìm thấy). Hành động tiếp theo nên làm?",
          options: [
            "A. Coi như nguồn đó tồn tại thật vì đường link trông rất giống link chính thức",
            "B. Tìm kiếm tiêu đề nội dung hoặc mã DOI trên cơ sở dữ liệu độc lập hoặc lưu trữ web",
            "C. Sao chép nguyên văn liên kết chết đó vào tài liệu trích dẫn",
            "D. Bỏ qua không cần kiểm tra bài nữa"
          ],
          correctAnswer: 1, // B
          explanation: "AI thường sinh đường link ảo (Hallucinated URLs). Cần tìm nội dung độc lập để kiểm chứng."
        },
        {
          id: "q9",
          question: "Có hai trang báo điện tử cùng đưa một thông tin với câu chữ giống hệt nhau. Hai trang này có chắc chắn là hai nguồn độc lập?",
          options: [
            "A. Chắc chắn là hai nguồn độc lập vì có hai tên miền khác nhau",
            "B. Không nhất thiết; cần truy vết xem cả hai có cùng sao chép từ một thông cáo báo chí hoặc một hãng tin duy nhất",
            "C. Có, nếu cả hai trang đều có dấu tích xanh trên mạng xã hội",
            "D. Chắc chắn đúng 100% vì có nhiều báo cùng đăng"
          ],
          correctAnswer: 1, // B
          explanation: "Hiện tượng đồng vọng thông tin (echo-chamber) khi nhiều báo cùng đăng lại một thông cáo báo chí."
        },
        {
          id: "q10",
          question: "Khi đối chiếu số liệu thống kê giữa các nguồn nghiên cứu khác nhau, yếu tố quan trọng nhất cần so sánh là gì?",
          options: [
            "A. Năm thực hiện, quy mô mẫu khảo sát, định nghĩa khái niệm và phương pháp thu thập dữ liệu",
            "B. Độ dài bài báo và phong cách thiết kế biểu đồ",
            "C. Số lượng trang mạng dẫn lại số liệu đó",
            "D. Số liệu nào lớn hơn thì chọn số liệu đó"
          ],
          correctAnswer: 0, // A
          explanation: "Quy mô mẫu, phương pháp và định nghĩa là cốt lõi của tính hợp lệ trong nghiên cứu định lượng."
        },
        {
          id: "q11",
          question: "Nguồn A đưa số liệu là 35%, nhưng nguồn B đưa số liệu là 60% cho cùng một vấn đề. Cách giải quyết đúng đắn nhất?",
          options: [
            "A. Chọn số liệu 60% vì số lớn hơn thì đáng tin cậy hơn",
            "B. Tìm hiểu sự khác biệt về phương pháp, thời điểm khảo sát và tiêu chí đo lường của cả hai nguồn",
            "C. Lấy trung bình cộng (35 + 60) / 2 = 47.5%",
            "D. Chọn nguồn nào xuất hiện đầu tiên trên Google"
          ],
          correctAnswer: 1, // B
          explanation: "Cần tìm nguyên nhân của sự khác biệt thông qua phương pháp và tiêu chí đo."
        },
        {
          id: "q12",
          question: "Một bức ảnh sự kiện do AI mô tả kèm theo. Muốn xác minh bức ảnh có phải bị cắt ghép hoặc chụp ở thời điểm khác, em làm gì?",
          options: [
            "A. Tin vào nhận định mô tả bằng lời của AI",
            "B. Sử dụng công cụ tìm kiếm hình ảnh ngược (Reverse Image Search) để đối chiếu bối cảnh và nguồn gốc ban đầu",
            "C. Dựa hoàn toàn vào bình luận của cư dân mạng",
            "D. Phóng to ảnh lên màn hình để nhìn bằng mắt thường"
          ],
          correctAnswer: 1, // B
          explanation: "Tìm kiếm hình ảnh đảo ngược (Reverse Image Search) là phương pháp cốt lõi để xác minh ảnh số."
        },
        {
          id: "q13",
          question: "Một công ty kinh doanh thực phẩm chức năng đăng bài khẳng định 'sản phẩm đạt hiệu quả 99% theo nghiên cứu mới'. Cần lưu ý điều gì?",
          options: [
            "A. Nghi ngờ xung đột lợi ích thương mại và tìm kiếm nghiên cứu lâm sàng độc lập của bên thứ ba",
            "B. Khẳng định chắc chắn đúng vì doanh nghiệp không bao giờ nói sai về sản phẩm của mình",
            "C. Mọi sản phẩm có quảng cáo đều là lừa đảo hoàn toàn",
            "D. Tin tưởng nếu trang web có thiết kế đẹp mắt"
          ],
          correctAnswer: 0, // A
          explanation: "Xung đột lợi ích (Conflict of Interest) là nguy cơ sai lệch dữ liệu phổ biến nhất trong truyền thông thương mại."
        },
        {
          id: "q14",
          question: "Một bài báo khoa học được dán nhãn 'Preprint' (Bản thảo chưa bình duyệt). Em nên hiểu về tài liệu này thế nào?",
          options: [
            "A. Là tài liệu đã được thẩm định chuyên môn tuyệt đối bởi hội đồng khoa học",
            "B. Là nghiên cứu sơ bộ chưa qua phản biện đồng nghiệp, cần thận trọng và kiểm chứng thêm trước khi ứng dụng",
            "C. Là tài liệu chắc chắn sai sót vì chưa xuất bản",
            "D. Không có bất kỳ giá trị tham khảo nào"
          ],
          correctAnswer: 1, // B
          explanation: "Bản thảo Preprint chưa qua Peer-review nên cần thận trọng đặc biệt."
        },
        {
          id: "q15",
          question: "Một tài liệu do chuyên gia có tên tuổi viết nhưng được xuất bản từ năm 1995 trong lĩnh vực Trí tuệ nhân tạo. Em cần lưu ý điều gì?",
          options: [
            "A. Kiểm tra tính cập nhật vì công nghệ và dữ liệu AI thay đổi rất nhanh chóng theo thời gian",
            "B. Chấp nhận ngay toàn bộ vì tác giả là người có chuyên môn cao",
            "C. Bỏ qua ngày xuất bản vì sách in luôn luôn đúng",
            "D. Coi tài liệu là hoàn toàn vô giá trị"
          ],
          correctAnswer: 0, // A
          explanation: "Tính cập nhật (Currency/Timeliness) là tiêu chí thiết yếu trong các lĩnh vực phát triển nhanh như công nghệ thông tin."
        },
        {
          id: "q16",
          question: "Yếu tố nào làm tăng độ tin cậy của một số liệu thống kê trong bài nghiên cứu?",
          options: [
            "A. Phương pháp rõ ràng, thời điểm cụ thể và dữ liệu có thể truy vết nguồn gốc minh bạch",
            "B. Có nhiều chữ số thập phân lẻ ở phía sau dấu phẩy",
            "C. Có hàng ngàn lượt chia sẻ trên diễn đàn mạng",
            "D. Được trình bày bằng biểu đồ 3D màu sắc sặc sỡ"
          ],
          correctAnswer: 0, // A
          explanation: "Khả năng tái lập và truy vết dữ liệu minh bạch là nền tảng của độ tin cậy khoa học."
        },
        {
          id: "q17",
          question: "Sau khi tra cứu nhiều cơ sở dữ liệu uy tín nhưng chưa tìm thấy nguồn xác nhận khẳng định của AI, kết luận phù hợp nhất là gì?",
          options: [
            "A. Khẳng định thông tin đó đúng vì AI có vốn kiến thức siêu việt",
            "B. Ghi nhận là 'chưa đủ căn cứ xác thực' và không đưa vào làm luận cứ chính",
            "C. Kết luận chắc chắn thông tin đó là bịa đặt 100%",
            "D. Tự chế ra một nguồn tham khảo tương tự"
          ],
          correctAnswer: 1, // B
          explanation: "Thái độ khoa học nghiêm túc: khi thiếu bằng chứng thì kết luận là chưa đủ căn cứ."
        },
        {
          id: "q18",
          question: "Hai nguồn tin uy tín đưa ra kết luận trái chiều nhau về một xu hướng kinh tế. Cách kết luận đúng mực nhất của học sinh?",
          options: [
            "A. Chọn một quan điểm mà bản thân yêu thích hơn và lờ đi quan điểm còn lại",
            "B. Trình bày cả hai góc nhìn, nêu rõ bối cảnh và giả định nghiên cứu của từng nguồn",
            "C. Tự ý thay đổi số liệu để hai bên khớp với nhau",
            "D. Không đưa cả hai vào bài"
          ],
          correctAnswer: 1, // B
          explanation: "Tư duy phản biện đòi hỏi tôn trọng sự đa chiều và nêu rõ các điều kiện giả định."
        },
        {
          id: "q19",
          question: "Một câu trả lời của AI gồm 3 đoạn: Đoạn 1 đã kiểm chứng đúng, Đoạn 2 và 3 chưa tìm thấy nguồn. Cách xử lý kết luận?",
          options: [
            "A. Coi toàn bộ câu trả lời là đúng vì Đoạn 1 đã chính xác",
            "B. Phân tách rõ: Phần đã được kiểm chứng độc lập xác nhận và Phần chưa đủ căn cứ",
            "C. Xóa bỏ cả 3 đoạn và kết luận AI nói sai",
            "D. Tự viết tiếp theo suy đoán cá nhân"
          ],
          correctAnswer: 1, // B
          explanation: "Tránh lỗi khái quát hóa bộ phận thành toàn thể; phân định rành mạch giữa dữ liệu đã kiểm và chưa kiểm."
        },
        {
          id: "q20",
          question: "Một kết luận có căn cứ khoa học hoàn chỉnh bắt buộc phải bao gồm những thành phần nào?",
          options: [
            "A. Kết luận rõ ràng, bằng chứng thực nghiệm đối chiếu và giới hạn/phạm vi áp dụng của kết luận đó",
            "B. Chỉ cần một câu khẳng định đao to búa lớn và tên một nhà khoa học",
            "C. Ý kiến chủ quan cá nhân và văn phong cảm xúc",
            "D. Một đường link mạng xã hội bất kỳ"
          ],
          correctAnswer: 0, // A
          explanation: "Bộ ba: Khẳng định (Claim) + Bằng chứng (Evidence) + Giới hạn (Limitation) tạo nên luận cứ chuẩn mực."
        }
      ]
    },
    {
      id: "exam_mini_10",
      title: "Mini Test: Nhận diện Ảo giác AI Cấp tốc (10 câu)",
      description: "Bài kiểm tra nhanh 10 câu trắc nghiệm kiểm tra khả năng phát hiện ảo giác (Hallucination) của AI trong 15 phút.",
      durationMinutes: 15,
      pointsPerQuestion: 2,
      passingScore: 12, // 10 câu x 2đ = 20đ, yêu cầu tối thiểu 12đ (60%)
      createdAt: "2026-10-07T08:00:00.000Z",
      questions: [
        {
          id: "m1",
          question: "Ảo giác AI (AI Hallucination) trong các mô hình ngôn ngữ lớn (LLM) là hiện tượng gì?",
          options: [
            "A. AI bị nhiễm virus độc hại từ máy chủ",
            "B. AI tạo ra các thông tin sai lệch, bịa đặt nhưng được diễn đạt rất tự tin và trôi chảy",
            "C. Màn hình máy tính bị nhấp nháy do hỏng card đồ họa",
            "D. AI từ chối trả lời câu hỏi của người dùng"
          ],
          correctAnswer: 1,
          explanation: "Ảo giác là khi LLM sinh thông tin không có thực nhưng với giọng văn hoàn toàn tự tin."
        },
        {
          id: "m2",
          question: "Khi yêu cầu AI trích dẫn bài báo khoa học, dấu hiệu nào cho thấy trích dẫn đó có thể là ảo giác?",
          options: [
            "A. Tác giả là giáo sư nổi tiếng",
            "B. Tên tạp chí nghe rất kêu nhưng tra cứu mã ISSN hoặc trang chính thức của nhà xuất bản thì không tồn tại bài báo đó",
            "C. Bài báo được viết bằng tiếng Anh",
            "D. Bài báo xuất bản trong vòng 5 năm gần đây"
          ],
          correctAnswer: 1,
          explanation: "AI thường ghép tên tác giả thật với tên bài báo bịa đặt thành một trích dẫn giả trông như thật."
        },
        {
          id: "m3",
          question: "Để giảm thiểu nguy cơ ảo giác khi prompt AI giải quyết bài toán phức tạp, kỹ thuật nào sau đây hữu hiệu nhất?",
          options: [
            "A. Yêu cầu AI trả lời thật ngắn trong 1 dòng",
            "B. Kỹ thuật 'Suy nghĩ từng bước' (Chain-of-Thought) và yêu cầu chỉ dẫn bằng chứng từ tài liệu cung cấp",
            "C. Dùng từ ngữ đe dọa AI nếu làm sai",
            "D. Lặp lại câu hỏi 10 lần liên tục"
          ],
          correctAnswer: 1,
          explanation: "Chain-of-Thought và RAG (Grounding dữ liệu) giúp mô hình suy luận mạch lạc và giảm sai lệch."
        },
        {
          id: "m4",
          question: "AI giải một bài toán phương trình bậc 3 ra đáp số x = 5. Cách kiểm chứng nhanh và chuẩn nhất?",
          options: [
            "A. Thay trực tiếp giá trị x = 5 vào lại phương trình ban đầu để tính toán",
            "B. Tin ngay vì máy tính tính toán bao giờ cũng đúng",
            "C. Hỏi lại chatbot xem có chắc chắn là 5 không",
            "D. Chụp màn hình gửi cho bạn bè"
          ],
          correctAnswer: 0,
          explanation: "Kiểm tra ngược (Reverse verification) bằng cách thế nghiệm vào bài toán là phương pháp nhanh nhất."
        },
        {
          id: "m5",
          question: "Khi cần số liệu dân số Việt Nam năm mới nhất, cách dùng AI nào an toàn nhất?",
          options: [
            "A. Hỏi trực tiếp một mô hình AI không có kết nối Internet",
            "B. Sử dụng tính năng tra cứu web có dẫn nguồn (Grounding Search) và kiểm tra lại từ Tổng cục Thống kê (GSO)",
            "C. Chấp nhận bất kỳ con số nào AI đưa ra",
            "D. Lấy trung bình cộng từ 3 chatbot khác nhau"
          ],
          correctAnswer: 1,
          explanation: "Tổng cục Thống kê (GSO) là nguồn sơ cấp có thẩm quyền cao nhất về số liệu dân số Việt Nam."
        },
        {
          id: "m6",
          question: "Một câu trả lời AI sử dụng cụm từ 'Theo các chuyên gia hàng đầu'. Đây là biểu hiện của:",
          options: [
            "A. Trích dẫn đầy đủ và chuẩn mực",
            "B. Dẫn chứng mơ hồ, thiếu danh tính cụ thể để kiểm chứng (Weasel words)",
            "C. Dấu hiệu của một bài báo khoa học xuất sắc",
            "D. Thông tin mật không thể tiết lộ"
          ],
          correctAnswer: 1,
          explanation: "'Chuyên gia hàng đầu' không rõ tên tuổi là biểu hiện kinh điển của thủ pháp lẩn tránh trách nhiệm trích dẫn."
        },
        {
          id: "m7",
          question: "Khi kiểm chứng tin tức do AI tổng hợp, bước đọc ngang (Lateral Reading) là gì?",
          options: [
            "A. Đọc từ trái sang phải thật chậm",
            "B. Mở các tab mới để kiểm tra danh tiếng của nguồn và tác giả trên các trang thông tin độc lập",
            "C. Nghiêng màn hình điện thoại nằm ngang khi đọc",
            "D. Chỉ đọc phần tiêu đề của các bài báo"
          ],
          correctAnswer: 1,
          explanation: "Lateral Reading (Đọc ngang) là kỹ năng cốt lõi của chuyên gia kiểm chứng thông tin chuyên nghiệp."
        },
        {
          id: "m8",
          question: "Tại sao không nên dựa vào độ dài và vẻ mượt mà của câu trả lời AI để đánh giá tính xác thực?",
          options: [
            "A. Vì AI được tối ưu hóa để tạo văn bản lưu loát, nhưng lưu loát không đồng nghĩa với chính xác sự thật",
            "B. Vì câu trả lời dài thường tốn dung lượng mạng",
            "C. Vì AI ghét viết văn bản dài",
            "D. Vì văn bản dài khó đọc đối với học sinh"
          ],
          correctAnswer: 0,
          explanation: "Sự lưu loát bề mặt (Fluency illusion) là cạm bẫy lớn nhất khiến người dùng dễ tin vào ảo giác AI."
        },
        {
          id: "m9",
          question: "Khi sử dụng AI để dịch một đoạn văn tài liệu lịch sử, rủi ro lớn nhất là gì?",
          options: [
            "A. AI dịch quá nhanh làm máy nóng",
            "B. AI có thể suy diễn và thêm thắt chi tiết sai lệch về ngữ cảnh lịch sử không có trong bản gốc",
            "C. Tốn chi phí tiền điện",
            "D. Bị lộ thông tin cá nhân"
          ],
          correctAnswer: 1,
          explanation: "AI dịch thuật có thể tự động hoàn chỉnh câu bằng cách chèn các suy đoán sai ngữ cảnh thời đại."
        },
        {
          id: "m10",
          question: "Quy tắc 'Tam giác kiểm chứng' (Triangulation) trong thẩm định thông tin AI gồm:",
          options: [
            "A. 3 học sinh cùng ngồi làm bài",
            "B. Đối chiếu tối thiểu 3 nguồn thông tin độc lập và có thẩm quyền trước khi chấp nhận khẳng định",
            "C. Vẽ hình tam giác lên giấy nháp",
            "D. Sử dụng 3 trình duyệt web khác nhau"
          ],
          correctAnswer: 1,
          explanation: "Triangulation đòi hỏi kiểm chứng chéo qua ít nhất 3 nguồn độc lập để đảm bảo khách quan."
        }
      ]
    },
    {
      id: "exam_adv_30",
      title: "Đấu trường Chuyên sâu: Kỹ năng Thẩm định Đa nguồn (30 câu)",
      description: "Bộ đề thử thách chuyên sâu 30 câu bao quát toàn diện quy trình kiểm chứng số, phân tích thiên vị và đạo đức AI.",
      durationMinutes: 45,
      pointsPerQuestion: 2,
      passingScore: 30, // 30 câu x 2đ = 60đ, yêu cầu tối thiểu 30đ để hoàn thành
      createdAt: "2026-10-07T08:00:00.000Z",
      questions: [] // Sẽ tự động gộp 20 câu đề 1 + 10 câu đề 2 thành bộ 30 câu phong phú
    }
  ];

  // Khởi tạo câu hỏi cho đề 30 câu bằng cách gộp và thêm câu mới
  DEFAULT_EXAMS[2].questions = [
    ...DEFAULT_EXAMS[0].questions,
    ...DEFAULT_EXAMS[1].questions
  ];

  const AICheckExamStore = {
    // 1. Quản lý danh sách Đề thi
    getExams() {
      try {
        const raw = localStorage.getItem(EXAM_BANK_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            let modified = false;
            parsed.forEach(e => {
              const qCount = e.questions?.length || 10;
              if (e.pointsPerQuestion == null || isNaN(e.pointsPerQuestion) || Number(e.pointsPerQuestion) <= 0) {
                e.pointsPerQuestion = 2;
                modified = true;
              }
              const maxS = qCount * e.pointsPerQuestion;
              if (e.passingScore == null || isNaN(e.passingScore) || Number(e.passingScore) <= 0) {
                e.passingScore = Math.ceil(maxS * 0.5);
                modified = true;
              }
            });
            if (modified) {
              this.saveExams(parsed);
            }
            return parsed;
          }
        }
      } catch (e) {
        console.warn("Lỗi đọc exam_bank từ localStorage:", e);
      }
      // Lưu lại đề mặc định nếu chưa có
      this.saveExams(DEFAULT_EXAMS);
      return DEFAULT_EXAMS;
    },

    saveExams(exams) {
      try {
        localStorage.setItem(EXAM_BANK_KEY, JSON.stringify(exams));
      } catch (e) {
        console.error("Lỗi lưu exam_bank vào localStorage:", e);
      }
    },

    getExamById(id) {
      const exams = this.getExams();
      return exams.find(e => e.id === id) || exams[0] || null;
    },

    saveExam(exam) {
      const exams = this.getExams();
      const idx = exams.findIndex(e => e.id === exam.id);
      if (idx >= 0) {
        exams[idx] = exam;
      } else {
        exams.unshift(exam);
      }
      this.saveExams(exams);
      return exam;
    },

    deleteExam(id) {
      let exams = this.getExams();
      exams = exams.filter(e => e.id !== id);
      this.saveExams(exams);
      return exams;
    },

    // 2. Quản lý Kết quả bài làm & Vi phạm phòng thi
    getResults() {
      try {
        const raw = localStorage.getItem(EXAM_RESULTS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
      return [];
    },

    saveResults(results) {
      try {
        localStorage.setItem(EXAM_RESULTS_KEY, JSON.stringify(results));
      } catch (e) {
        console.error("Lỗi lưu exam_results:", e);
      }
    },

    addResult(result) {
      const results = this.getResults();

      // Chuẩn hóa dữ liệu kết quả thi
      const pointsPerQ = Number(result.pointsPerQuestion) > 0 ? Number(result.pointsPerQuestion) : 2;
      const totalQ = Number(result.totalQuestions) > 0 ? Number(result.totalQuestions) : (result.questions?.length || 20);
      const correctCount = Number(result.correctCount) || 0;
      const maxScore = Number(result.maxScore) > 0 ? Number(result.maxScore) : (totalQ * pointsPerQ);
      const earnedScore = result.score != null ? Number(result.score) : (correctCount * pointsPerQ);
      const passingScore = result.passingScore != null ? Number(result.passingScore) : Math.ceil(maxScore * 0.5);
      const passed = result.passed !== undefined ? Boolean(result.passed) : (earnedScore >= passingScore);
      const studentDisplayName = (result.studentName || "Thí sinh THĐ").trim().slice(0, 24);

      // Đếm số lần thí sinh này đã làm đề này trong quá khứ để gắn số lần thi (Lần 1, Lần 2...)
      const pastAttempts = results.filter(r => 
        r.examId === result.examId && 
        (r.studentName || "").toLowerCase().trim() === studentDisplayName.toLowerCase()
      ).length;
      const attemptNumber = result.attemptNumber || (pastAttempts + 1);

      const uniqueId = result.id || ("res_" + Date.now() + "_" + Math.floor(Math.random() * 1000));
      const submittedTime = result.submittedAt || new Date().toISOString();

      const normalizedResult = {
        ...result,
        id: uniqueId,
        attemptNumber: attemptNumber,
        studentName: studentDisplayName,
        pointsPerQuestion: pointsPerQ,
        totalQuestions: totalQ,
        correctCount: correctCount,
        maxScore: maxScore,
        score: earnedScore,
        passingScore: passingScore,
        passed: passed,
        submittedAt: submittedTime
      };

      // Luôn chèn bản ghi mới độc lập lên đầu danh sách (mỗi lần thi là 1 kết quả riêng biệt)
      results.unshift(normalizedResult);
      this.saveResults(results);

      // Phát sự kiện toàn cục và storage key để trang Admin tự cập nhật thời gian thực
      try {
        window.dispatchEvent(new CustomEvent("aicheck:exam-results-updated", { detail: normalizedResult }));
        localStorage.setItem("aicheck:last_exam_submission", JSON.stringify({
          time: Date.now(),
          id: uniqueId,
          examId: result.examId,
          studentName: studentDisplayName,
          examTitle: normalizedResult.examTitle,
          attemptNumber: attemptNumber,
          score: earnedScore,
          maxScore: maxScore,
          passed: passed
        }));
      } catch {}

      // Đồng bộ sang Bảng xếp hạng (BXH) và Supabase
      try {
        const scale100 = maxScore > 0 ? Math.min(100, Math.max(0, Math.round((earnedScore / maxScore) * 100))) : 0;

        // 1. Gửi lên Supabase Leaderboard (activity: "exam") - mỗi lần nộp là 1 dòng riêng trong CSDL đám mây
        if (window.AICheckCloud && window.AICheckCloud.saveScore) {
          window.AICheckCloud.saveScore({
            name: studentDisplayName,
            activity: "exam",
            score: scale100
          });
        }

        // 2. Đồng bộ vào danh sách thành tích cục bộ (aicheck:records) để BXH thiết bị luôn có dữ liệu
        try {
          const rawRecords = localStorage.getItem("aicheck:records");
          let recordsList = rawRecords ? JSON.parse(rawRecords) : [];
          if (!Array.isArray(recordsList)) recordsList = [];

          const existingIdx = recordsList.findIndex(r => r.name && r.name.toLowerCase() === studentDisplayName.toLowerCase());
          const todayDate = new Date().toISOString().slice(0, 10);

          if (existingIdx >= 0) {
            recordsList[existingIdx].exam = Math.max(Number(recordsList[existingIdx].exam) || 0, scale100);
            recordsList[existingIdx].date = todayDate;
          } else {
            recordsList.unshift({
              name: studentDisplayName,
              exam: scale100,
              date: todayDate
            });
          }
          localStorage.setItem("aicheck:records", JSON.stringify(recordsList));
        } catch (storageErr) {
          console.warn("Lỗi đồng bộ aicheck:records:", storageErr);
        }
      } catch (e) {
        console.warn("Lỗi sync exam result to leaderboard:", e);
      }

      return normalizedResult;
    },

    deleteResult(id) {
      let results = this.getResults();
      results = results.filter(r => r.id !== id);
      this.saveResults(results);
      return results;
    },

    clearAllResults() {
      localStorage.removeItem(EXAM_RESULTS_KEY);
    }
  };

  window.AICheckExamStore = AICheckExamStore;
})();

