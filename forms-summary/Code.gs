// ============================================================================
// HƯỚNG DẪN CẤU HÌNH:
// 1. Mở file Google Sheets chứa câu trả lời khảo sát của bạn.
// 2. Nhìn lên thanh địa chỉ URL: https://docs.google.com/spreadsheets/d/[ID_NẰM_Ở_ĐÂY]/edit
// 3. Sao chép đoạn mã ID đó và dán vào SPREADSHEET_ID dưới đây:
// ============================================================================
const SPREADSHEET_ID = "1Q-ny5KLtcqEk6hxkoryK1Bd-6f4DGtPVU_Swwrky538";
const RESPONSE_SHEET_NAME = "Câu trả lời biểu mẫu 1";

// Mẫu lọc các cột nhạy cảm / định danh cá nhân / cột hệ thống
const EXCLUDED_HEADER_PATTERN =
  /dấu thời gian|timestamp|họ và tên|bạn tên|tên bạn(?!.*lớp)|email|điện thoại|^\s*lý do\s*$|đoạn ngắn|ý kiến|chia sẻ|giải pháp|^cột\s*\d+$|^phần\s*\d+/i;

const MULTI_SELECT_HEADER_PATTERN =
  /chọn nhiều phương án|chọn các phương án|các phương án bạn áp dụng|hộp kiểm|mục đích nào nhất|môn nào/i;

// Nâng giới hạn ký tự phương án lên 250 để không làm mất nội dung các phương án dài
const MAX_OPTION_LABEL_LENGTH = 250;

function doGet(event) {
  const callback = String(event && event.parameter && event.parameter.callback || "");
  if (!/^[A-Za-z_$][0-9A-Za-z_$]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput("Invalid callback")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  let result;
  try {
    result = getSummary();
  } catch (error) {
    console.error(error);
    result = {
      error: "Không đọc được bảng phản hồi: " + (error && error.message ? error.message : String(error))
    };
  }

  const json = JSON.stringify(result)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return ContentService.createTextOutput(`${callback}(${json});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getSummary() {
  let spreadsheet = null;
  try {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}

  if (!spreadsheet) {
    if (!SPREADSHEET_ID || SPREADSHEET_ID === "PASTE_SPREADSHEET_ID_HERE") {
      throw new Error("Chưa cấu hình SPREADSHEET_ID. Hãy dán ID của bảng tính Google Sheets vào dòng 1 của Code.gs.");
    }
    spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  const responseSheet = findResponseSheet(spreadsheet);
  const lastRow = responseSheet.getLastRow();
  const lastColumn = responseSheet.getLastColumn();
  if (!lastRow || !lastColumn) {
    return { totalResponses: 0, updatedAt: new Date().toISOString(), questions: [] };
  }

  const values = responseSheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
  const headers = values[0].map((header) => String(header || "").replace(/\s+/g, " ").trim());
  const rows = values.slice(1);
  const timestampColumn = headers.findIndex((header) => /dấu thời gian|timestamp/i.test(header));
  const totalResponses = rows.filter((row) => timestampColumn >= 0
    ? Boolean(String(row[timestampColumn] || "").trim())
    : row.some((value) => String(value || "").trim())).length;

  const questions = [];
  headers.forEach((header, columnIndex) => {
    if (!header || EXCLUDED_HEADER_PATTERN.test(header)) return;

    const multiSelect = MULTI_SELECT_HEADER_PATTERN.test(header);
    const counts = Object.create(null);
    let responseCount = 0;

    rows.forEach((row) => {
      const answer = String(row[columnIndex] || "").trim();
      if (!answer) return;
      responseCount += 1;

      // Tách phương án chọn nhiều: không tách dấu phẩy nằm trong dấu ngoặc đơn
      const answers = multiSelect ? splitMultiSelectAnswer(answer) : [answer];
      answers.forEach((rawOption) => {
        let option = normalizeOption(rawOption);
        if (!option) return;
        if (/chi đoàn|lớp/i.test(header)) {
          option = option.toUpperCase().replace(/\s+/g, "");
        }
        counts[option] = (counts[option] || 0) + 1;
      });
    });

    // Bỏ qua các cột không có dữ liệu trả lời
    if (responseCount === 0 || Object.keys(counts).length === 0) return;

    // Kiểm tra an toàn: Nếu toàn bộ câu trả lời là danh sách tên riêng độc nhất (count = 1) -> ẩn để bảo vệ quyền riêng tư
    const labels = Object.keys(counts);
    const isNameList = labels.length >= 3 && labels.every(l => counts[l] === 1 && /[A-ZÀ-Ỹ][a-zà-ỹ]+(\s+[A-ZÀ-Ỹ][a-zà-ỹ]+)+/u.test(l));
    if (isNameList) return;

    const cleanTitle = sanitizeTitle(header);

    const options = labels
      .map((label) => ({
        label,
        count: counts[label],
        percentage: responseCount
          ? Math.round(counts[label] / responseCount * 1000) / 10
          : 0
      }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "vi"));

    questions.push({ title: cleanTitle, responseCount, multiSelect, options });
  });

  // Tự động tổng hợp câu hỏi "Khối lớp của bạn" từ cột Lớp (nếu chưa có cột Khối riêng biệt)
  const classQuestion = questions.find((q) => /chi đoàn|thuộc.*lớp|lớp nào/i.test(q.title));
  const hasGradeQuestion = questions.some((q) => /khối lớp/i.test(q.title));
  if (classQuestion && !hasGradeQuestion) {
    const gradeCounts = Object.create(null);
    let gradeTotal = 0;
    classQuestion.options.forEach((opt) => {
      let g = "Khối 12";
      if (/^12/i.test(opt.label)) g = "Khối 12";
      else if (/^11/i.test(opt.label)) g = "Khối 11";
      else if (/^10/i.test(opt.label)) g = "Khối 10";
      gradeCounts[g] = (gradeCounts[g] || 0) + opt.count;
      gradeTotal += opt.count;
    });

    const gradeOptions = Object.keys(gradeCounts)
      .map((g) => ({
        label: g,
        count: gradeCounts[g],
        percentage: gradeTotal ? Math.round((gradeCounts[g] / gradeTotal) * 1000) / 10 : 0
      }))
      .sort((left, right) => right.count - left.count);

    questions.unshift({
      title: "Khối lớp của bạn",
      responseCount: gradeTotal,
      multiSelect: false,
      options: gradeOptions
    });
  }

  return { totalResponses, updatedAt: new Date().toISOString(), questions };
}

function findResponseSheet(spreadsheet) {
  const sheets = spreadsheet.getSheets();
  if (RESPONSE_SHEET_NAME) {
    const namedSheet = sheets.find((sheet) => sheet.getName() === RESPONSE_SHEET_NAME);
    if (!namedSheet) {
      throw new Error(`Response sheet "${RESPONSE_SHEET_NAME}" was not found.`);
    }
    return namedSheet;
  }

  const responseSheet = sheets.find((sheet) =>
    /^(form responses|câu trả lời biểu mẫu)(\s+\d+)?$/i.test(sheet.getName().trim())
  );
  if (responseSheet) return responseSheet;
  if (sheets.length > 0) return sheets[0];
  throw new Error("Không tìm thấy trang tính nào trong tệp Google Sheets này.");
}

function sanitizeTitle(header) {
  let title = String(header || "").replace(/\s+/g, " ").trim();
  // Giữ nguyên tiêu đề gốc của biểu mẫu (bao gồm cả Tình huống 1:, Tình huống 2:...)
  // Đối với câu hỏi lưới ma trận kỹ năng, chuẩn hóa nhãn rõ ràng
  const gridMatch = title.match(/\[(.*?)\]/);
  if (gridMatch && /đánh giá mức độ tự tin/i.test(title)) {
    title = `Đánh giá mức độ tự tin: [${gridMatch[1].trim()}]`;
  }
  // Chuyển markdown link [URL](URL) -> URL thông thường
  title = title.replace(/\[(https?:\/\/[^\]]+)\]\([^\)]+\)/g, "$1");
  return title;
}

function splitMultiSelectAnswer(answer) {
  // Không tách các dấu phẩy nằm trong ngoặc đơn
  const parts = answer.split(/,\s*(?![^\(]*\))/g).map(s => s.trim()).filter(Boolean);
  const result = [];
  
  // Tái gộp các cụm từ bị tách nhầm
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === "định nghĩa" || p === "kiến thức chung") {
      // Đã gộp vào "Tìm kiếm thông tin, định nghĩa, kiến thức chung"
      continue;
    }
    if (p === "Tìm kiếm thông tin") {
      result.push("Tìm kiếm thông tin, định nghĩa, kiến thức chung");
      continue;
    }
    result.push(p);
  }
  return result;
}

function normalizeOption(value) {
  let option = String(value || "").replace(/\s+/g, " ").trim();
  if (/^(khác|other)\s*[:：]/i.test(option)) return "Khác (nội dung khác đã ẩn)";
  if (option.length > MAX_OPTION_LABEL_LENGTH) return option.slice(0, MAX_OPTION_LABEL_LENGTH) + "…";
  return option;
}
