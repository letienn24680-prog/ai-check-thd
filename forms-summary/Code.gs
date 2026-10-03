const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID_HERE";
const RESPONSE_SHEET_NAME = "";
const EXCLUDED_HEADER_PATTERN =
  /dấu thời gian|timestamp|họ và tên|bạn tên|tên bạn|email|điện thoại|lý do|đoạn ngắn|ý kiến|chia sẻ|giải pháp/i;
const MULTI_SELECT_HEADER_PATTERN =
  /chọn nhiều phương án|chọn các phương án|các phương án bạn áp dụng|hộp kiểm/i;
const MAX_OPTION_LABEL_LENGTH = 90;

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
      error: "Không đọc được bảng phản hồi. Kiểm tra tên trang tính và quyền truy cập của Apps Script."
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
  if (!SPREADSHEET_ID || SPREADSHEET_ID === "PASTE_SPREADSHEET_ID_HERE") {
    throw new Error("Set SPREADSHEET_ID to the ID of the response spreadsheet.");
  }

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
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

      const answers = multiSelect ? answer.split(/,\s*/) : [answer];
      answers.forEach((rawOption) => {
        const option = normalizeOption(rawOption);
        if (!option) return;
        counts[option] = (counts[option] || 0) + 1;
      });
    });

    const options = Object.keys(counts)
      .map((label) => ({
        label,
        count: counts[label],
        percentage: responseCount
          ? Math.round(counts[label] / responseCount * 1000) / 10
          : 0
      }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "vi"));

    questions.push({ title: header, responseCount, multiSelect, options });
  });

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
  if (sheets.length === 1) return sheets[0];
  throw new Error("Could not identify the Google Forms response sheet.");
}

function normalizeOption(value) {
  const option = String(value || "").replace(/\s+/g, " ").trim();
  if (/^(khác|other)\s*[:：]/i.test(option)) return "Khác (nội dung khác đã ẩn)";
  if (option.length > MAX_OPTION_LABEL_LENGTH) return "Phản hồi dài (nội dung đã ẩn)";
  return option;
}
