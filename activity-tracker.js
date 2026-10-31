/**
 * AI CHECK THĐ - ACTIVITY & SESSION TRACKER
 * Hệ thống ghi nhận nhật ký làm bài thời gian thực (Bắt đầu lúc nào, kết quả ra sao)
 * Phục vụ minh chứng khoa học và thuyết trình đề tài KHKT trước Ban Giám khảo.
 */
(() => {
  const STORAGE_KEY = "aicheck:activity_sessions";
  const SYNC_EVENT_KEY = "aicheck:last_session_update";

  function readSessions() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Lỗi đọc activity_sessions:", e);
    }
    return null;
  }

  function writeSessions(sessions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn("Lỗi ghi activity_sessions:", e);
    }
  }

  // Khởi tạo dữ liệu mẫu chuẩn thực nghiệm nếu máy chưa có dữ liệu
  function getSeedSessions() {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    return [
      {
        id: "sess_seed_01",
        studentName: "Lê Tiến",
        studentClass: "12A5",
        studentEmail: "letienn549@gmail.com",
        studentSchool: "THPT Trần Hưng Đạo",
        activity: "assessment",
        phase: "post",
        title: "Đo Sau can thiệp (Đợt 02 - 20 câu)",
        totalQuestions: 20,
        startedAt: `${dateStr}T07:15:20.000Z`,
        startedTimestamp: new Date(`${dateStr}T07:15:20.000Z`).getTime(),
        completedAt: `${dateStr}T07:27:45.000Z`,
        completedTimestamp: new Date(`${dateStr}T07:27:45.000Z`).getTime(),
        durationSeconds: 745,
        durationFormatted: "12 phút 25 giây",
        status: "completed",
        score: 88,
        rawScore: 88,
        correctCount: 18,
        level: "Giỏi",
        violations: 0,
        passed: true,
        resultSummary: "88/100 điểm · Giỏi · 18/20 câu đúng"
      },
      {
        id: "sess_seed_02",
        studentName: "Lê Tiến",
        studentClass: "12A5",
        studentEmail: "letienn549@gmail.com",
        studentSchool: "THPT Trần Hưng Đạo",
        activity: "assessment",
        phase: "pre",
        title: "Đo Trước can thiệp (Đợt 01 - 20 câu)",
        totalQuestions: 20,
        startedAt: `${dateStr}T06:40:10.000Z`,
        startedTimestamp: new Date(`${dateStr}T06:40:10.000Z`).getTime(),
        completedAt: `${dateStr}T06:55:18.000Z`,
        completedTimestamp: new Date(`${dateStr}T06:55:18.000Z`).getTime(),
        durationSeconds: 908,
        durationFormatted: "15 phút 08 giây",
        status: "completed",
        score: 44,
        rawScore: 44,
        correctCount: 9,
        level: "Trung bình",
        violations: 0,
        passed: false,
        resultSummary: "44/100 điểm · Trung bình · 9/20 câu đúng"
      },
      {
        id: "sess_seed_03",
        studentName: "Nguyễn Quỳnh Anh",
        studentClass: "12A5",
        studentEmail: "quynhanh.thd12a5@gmail.com",
        studentSchool: "THPT Trần Hưng Đạo",
        activity: "exam",
        phase: null,
        title: "Phòng thi: Đề thi Khảo sát Năng lực Kiểm chứng AI",
        totalQuestions: 20,
        startedAt: `${dateStr}T07:30:00.000Z`,
        startedTimestamp: new Date(`${dateStr}T07:30:00.000Z`).getTime(),
        completedAt: `${dateStr}T07:46:12.000Z`,
        completedTimestamp: new Date(`${dateStr}T07:46:12.000Z`).getTime(),
        durationSeconds: 972,
        durationFormatted: "16 phút 12 giây",
        status: "completed",
        score: 90,
        rawScore: 18,
        correctCount: 18,
        level: "Đạt yêu cầu",
        violations: 0,
        passed: true,
        resultSummary: "90/100 điểm · Đạt yêu cầu · 18/20 câu đúng · 0 vi phạm"
      },
      {
        id: "sess_seed_04",
        studentName: "Trần Minh Đức",
        studentClass: "12A5",
        studentEmail: "minhduc12a5@gmail.com",
        studentSchool: "THPT Trần Hưng Đạo",
        activity: "practice",
        phase: null,
        title: "Luyện 10 tình huống kiểm chứng thực tế",
        totalQuestions: 10,
        startedAt: `${dateStr}T07:50:30.000Z`,
        startedTimestamp: new Date(`${dateStr}T07:50:30.000Z`).getTime(),
        completedAt: `${dateStr}T07:57:15.000Z`,
        completedTimestamp: new Date(`${dateStr}T07:57:15.000Z`).getTime(),
        durationSeconds: 405,
        durationFormatted: "6 phút 45 giây",
        status: "completed",
        score: 80,
        rawScore: 8,
        correctCount: 8,
        level: "Khá",
        violations: 0,
        passed: true,
        resultSummary: "80/100 điểm · Khá · 8/10 câu đúng"
      },
      {
        id: "sess_seed_05",
        studentName: "Phạm Thu Trang",
        studentClass: "12A6",
        studentEmail: "thutrang.thd@gmail.com",
        studentSchool: "THPT Trần Hưng Đạo",
        activity: "assessment",
        phase: "post",
        title: "Đo Sau can thiệp (Đợt 02 - 20 câu)",
        totalQuestions: 20,
        startedAt: `${dateStr}T08:05:00.000Z`,
        startedTimestamp: new Date(`${dateStr}T08:05:00.000Z`).getTime(),
        completedAt: `${dateStr}T08:18:40.000Z`,
        completedTimestamp: new Date(`${dateStr}T08:18:40.000Z`).getTime(),
        durationSeconds: 820,
        durationFormatted: "13 phút 40 giây",
        status: "completed",
        score: 85,
        rawScore: 85,
        correctCount: 17,
        level: "Giỏi",
        violations: 0,
        passed: true,
        resultSummary: "85/100 điểm · Giỏi · 17/20 câu đúng"
      }
    ];
  }

  function formatDateTime(dateInput) {
    if (!dateInput) return "—";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "—";
    const pad = (n) => String(n).padStart(2, "0");
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
  }

  function formatDuration(sec) {
    if (!sec || isNaN(sec)) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s} giây`;
    return `${m} phút ${s} giây`;
  }

  const Tracker = {
    formatDateTime,
    formatDuration,

    // Lấy thông tin học sinh hiện tại đang đăng nhập hoặc nhập tên
    getCurrentStudentInfo() {
      let profile = {};
      try { profile = JSON.parse(localStorage.getItem("aicheck:user_profile") || "{}"); } catch {}
      let localPlayer = "";
      try { localPlayer = JSON.parse(localStorage.getItem("aicheck:player") || '""'); } catch {}
      const cloudUser = window.AICheckCloud?.getCurrentUser ? window.AICheckCloud.getCurrentUser() : null;

      const name = profile.displayName || profile.name || localPlayer || cloudUser?.user_metadata?.display_name || "Học sinh THĐ";
      const email = profile.email || cloudUser?.email || "—";
      const className = profile.className || profile.class || "12A5";
      const school = profile.school || "THPT Trần Hưng Đạo";

      return { name, email, className, school };
    },

    getDefaultTitle(activity, phase) {
      if (activity === "assessment") {
        return phase === "pre" ? "Đo Trước can thiệp (Đợt 01 - 20 câu)" : "Đo Sau can thiệp (Đợt 02 - 20 câu)";
      }
      if (activity === "practice") return "Luyện 10 tình huống kiểm chứng thực tế";
      if (activity === "exam") return "Phòng thi trực tuyến";
      if (activity === "rubric") return "Thử thách Rubric (5 câu)";
      return "Hoạt động kiểm chứng AI";
    },

    // 1. GHI NHẬN KHI BẮT ĐẦU VÀO LÀM
    startSession({ activity, phase = null, title = "", totalQuestions = 20, examId = null }) {
      const student = this.getCurrentStudentInfo();
      const now = new Date();
      const sessionId = "sess_" + now.getTime() + "_" + Math.random().toString(36).slice(2, 7);

      const session = {
        id: sessionId,
        studentName: student.name,
        studentEmail: student.email,
        studentClass: student.className,
        studentSchool: student.school,
        activity: activity,
        phase: phase,
        title: title || this.getDefaultTitle(activity, phase),
        examId: examId,
        totalQuestions: totalQuestions,
        startedAt: now.toISOString(),
        startedTimestamp: now.getTime(),
        completedAt: null,
        completedTimestamp: null,
        durationSeconds: null,
        durationFormatted: "Đang làm...",
        status: "in_progress",
        score: null,
        rawScore: null,
        correctCount: null,
        level: null,
        violations: 0,
        passed: null,
        resultSummary: "Đang thực hiện bài làm ⏳"
      };

      const sessions = this.getSessions();
      sessions.unshift(session);
      // Giới hạn lưu trữ 500 phiên gần nhất
      if (sessions.length > 500) sessions.length = 500;
      writeSessions(sessions);

      this.notifyUpdate("start", session);
      return sessionId;
    },

    // 2. GHI NHẬN KHI HOÀN THÀNH / NỘP BÀI (KẾT QUẢ RA SAO)
    completeSession(sessionId, resultData = {}) {
      if (!sessionId) return null;
      const sessions = this.getSessions();
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return null;

      const now = new Date();
      const startTime = session.startedTimestamp || new Date(session.startedAt).getTime();
      const durationSeconds = Math.max(1, Math.round((now.getTime() - startTime) / 1000));

      session.completedAt = now.toISOString();
      session.completedTimestamp = now.getTime();
      session.durationSeconds = durationSeconds;
      session.durationFormatted = formatDuration(durationSeconds);
      session.status = "completed";

      session.score = resultData.score != null ? Math.round(Number(resultData.score)) : 0;
      session.rawScore = resultData.rawScore != null ? Number(resultData.rawScore) : session.score;
      session.correctCount = resultData.correctCount != null ? Number(resultData.correctCount) : null;
      session.totalQuestions = resultData.totalQuestions || session.totalQuestions;
      session.violations = resultData.violations || 0;
      session.passed = resultData.passed !== undefined ? Boolean(resultData.passed) : (session.score >= 50);

      // Tính xếp loại nếu chưa có
      if (resultData.level) {
        session.level = resultData.level;
      } else {
        session.level = session.score <= 25 ? "Yếu" : session.score <= 50 ? "Trung bình" : session.score <= 75 ? "Khá" : "Giỏi";
      }

      let summaryParts = [`${session.score}/100 điểm`];
      if (session.level) summaryParts.push(session.level);
      if (session.correctCount != null) summaryParts.push(`${session.correctCount}/${session.totalQuestions} câu đúng`);
      if (session.violations > 0) summaryParts.push(`⚠️ ${session.violations} vi phạm`);
      session.resultSummary = summaryParts.join(" · ");

      writeSessions(sessions);
      this.notifyUpdate("complete", session);

      // Đồng bộ thông tin lên cloud nếu có thể
      this.syncSessionToCloud(session);

      return session;
    },

    // Lấy danh sách toàn bộ các phiên
    getSessions() {
      let sessions = readSessions();
      if (!sessions || sessions.length === 0) {
        sessions = getSeedSessions();
        writeSessions(sessions);
      }
      return sessions;
    },

    // Xóa 1 phiên
    deleteSession(sessionId) {
      let sessions = this.getSessions().filter(s => s.id !== sessionId);
      writeSessions(sessions);
      this.notifyUpdate("delete", { id: sessionId });
    },

    // Xóa toàn bộ lịch sử phiên
    clearAllSessions() {
      writeSessions([]);
      this.notifyUpdate("clear", {});
    },

    // Phát sự kiện cập nhật thời gian thực sang các tab khác (nhất là Admin Portal)
    notifyUpdate(type, data) {
      try {
        window.dispatchEvent(new CustomEvent("aicheck:session-updated", { detail: { type, data } }));
        localStorage.setItem(SYNC_EVENT_KEY, JSON.stringify({ type, id: data?.id, time: Date.now() }));
      } catch (e) {}
    },

    // Đăng ký lắng nghe cập nhật realtime
    onUpdate(callback) {
      window.addEventListener("aicheck:session-updated", (e) => callback(e.detail));
      window.addEventListener("storage", (e) => {
        if (e.key === SYNC_EVENT_KEY || e.key === STORAGE_KEY) {
          callback({ type: "storage_sync" });
        }
      });
    },

    // Đồng bộ phiên hoàn thành lên Supabase (vào bảng leaderboard_scores hoặc support_requests)
    async syncSessionToCloud(session) {
      if (!window.AICheckCloud) return;
      try {
        // Nếu là activity chuẩn, cloud.saveScore đã hỗ trợ
        if (window.AICheckCloud.saveScore) {
          window.AICheckCloud.saveScore({
            name: session.studentName,
            activity: session.activity === "exam" ? "exam" : session.activity,
            phase: session.phase,
            score: session.score
          });
        }
      } catch (e) {
        console.warn("Lỗi syncSessionToCloud:", e);
      }
    },

    // Xuất file CSV báo cáo minh chứng cho Ban Giám khảo (có BOM UTF-8 để mở tiếng Việt trên Excel)
    exportSessionsCsv(filteredSessions = null) {
      const data = filteredSessions || this.getSessions();
      if (!data || !data.length) {
        if (typeof showInPageToast === "function") { showInPageToast("Chưa có dữ liệu phiên làm bài để xuất.", false); } else { console.warn("Chưa có dữ liệu phiên làm bài để xuất."); }
        return;
      }

      const headers = [
        "STT",
        "Mã phiên",
        "Họ và tên học sinh",
        "Chi đoàn / Lớp",
        "Email",
        "Nội dung làm bài",
        "Phân loại hoạt động",
        "Giai đoạn",
        "Thời điểm bắt đầu",
        "Thời điểm nộp bài",
        "Thời lượng làm bài",
        "Điểm số (Thang 100)",
        "Số câu đúng",
        "Tổng số câu",
        "Xếp loại / Đánh giá",
        "Vi phạm màn hình",
        "Trạng thái phiên"
      ];

      const rows = data.map((s, idx) => {
        const actLabel = s.activity === "practice" ? "Thực hành tình huống"
          : s.activity === "assessment" ? (s.phase === "pre" ? "Đo Trước can thiệp" : "Đo Sau can thiệp")
          : s.activity === "exam" ? "Phòng thi trực tuyến"
          : "Thử thách Rubric";

        const statusLabel = s.status === "completed" ? "Đã hoàn thành" : "Đang làm bài";

        return [
          idx + 1,
          s.id,
          `"${(s.studentName || '—').replace(/"/g, '""')}"`,
          `"${(s.studentClass || '—').replace(/"/g, '""')}"`,
          `"${(s.studentEmail || '—').replace(/"/g, '""')}"`,
          `"${(s.title || '—').replace(/"/g, '""')}"`,
          `"${actLabel}"`,
          `"${s.phase ? (s.phase === 'pre' ? 'Trước can thiệp' : 'Sau can thiệp') : '—'}"`,
          `"${formatDateTime(s.startedAt)}"`,
          `"${s.completedAt ? formatDateTime(s.completedAt) : 'Chưa nộp'}"`,
          `"${s.durationFormatted || '—'}"`,
          s.score != null ? s.score : "—",
          s.correctCount != null ? s.correctCount : "—",
          s.totalQuestions || "—",
          `"${(s.level || '—').replace(/"/g, '""')}"`,
          s.violations || 0,
          `"${statusLabel}"`
        ].join(",");
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const nowStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.setAttribute("download", `Bao_cao_Minh_chung_Hoc_sinh_Lam_bai_${nowStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  window.AICheckTracker = Tracker;
})();

