(() => {
  const status = document.getElementById("formSummaryStatus");
  const total = document.getElementById("formResponseTotal");
  const container = document.getElementById("formQuestionStats");
  const endpoint = window.AICheckFormSummaryUrl;
  const refreshInterval = 30000;
  let requestPending = false;

  function setStatus(message, isError) {
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

  function renderQuestion(question) {
    const card = document.createElement("article");
    card.className = "forms-question-card";

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
      appendText(card, "p", "forms-question-empty", "Chưa có câu trả lời cho câu hỏi này.");
    }

    return card;
  }

  function renderSummary(summary) {
    if (summary.error) {
      throw new Error(summary.error);
    }
    if (!Array.isArray(summary.questions) || !Number.isFinite(Number(summary.totalResponses))) {
      throw new Error("Dữ liệu tổng hợp trả về không đúng định dạng.");
    }

    total.textContent = Number(summary.totalResponses).toLocaleString("vi-VN");
    container.replaceChildren(...summary.questions.map(renderQuestion));

    const updatedAt = summary.updatedAt ? new Date(summary.updatedAt) : null;
    const updatedText = updatedAt && !Number.isNaN(updatedAt.valueOf())
      ? ` · cập nhật ${updatedAt.toLocaleTimeString("vi-VN")}`
      : "";
    setStatus(
      `Đã tải thống kê tổng hợp${updatedText}. Dữ liệu tự làm mới sau mỗi 30 giây.`,
      false
    );
  }

  function loadSummary() {
    if (requestPending) return;
    requestPending = true;

    const callbackName = `receiveAICheckForms_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      finish();
      setStatus("Hết thời gian chờ Apps Script. Hãy kiểm tra URL triển khai và quyền truy cập.", true);
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
        renderSummary(summary);
      } catch (error) {
        setStatus(`Không thể hiển thị thống kê: ${error.message}`, true);
      }
    };

    script.onerror = () => {
      finish();
      setStatus("Không tải được Apps Script. Hãy kiểm tra URL triển khai và quyền truy cập.", true);
    };

    const requestUrl = new URL(endpoint);
    requestUrl.searchParams.set("callback", callbackName);
    requestUrl.searchParams.set("_", String(Date.now()));
    script.src = requestUrl.href;
    document.head.append(script);
  }

  if (!endpoint) {
    setStatus("Chưa kết nối Google Sheets. Hãy triển khai Apps Script rồi thêm URL Web App vào forms-summary-config.js.", false);
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
    setStatus(`Cấu hình Apps Script không hợp lệ: ${error.message}`, true);
  }
})();
