(() => {
  // ==========================================================================
  // AI CHECK THĐ - WEB ENGINE 2026: MOTION, GAMIFICATION & THEME
  // Tối ưu hóa GPU Compositing (Transform & Opacity) chuẩn 60 FPS
  // Tích hợp: Theme Switcher Dark/Light, Web Audio Synthesizer, Gamification Engine
  // ==========================================================================

  // 0. Thiết lập Theme sớm nhất để tránh giật giao diện (Zero-FOUT)
  try {
    const savedTheme = localStorage.getItem("aicheck:theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", initialTheme);
  } catch {}

  // ==========================================================================
  // A. WEB AUDIO SYNTHESIZER (Không cần file mp3 ngoài, 100% Offline, Zero-Latency)
  // ==========================================================================
  const AICheckAudio = {
    ctx: null,
    enabled: true,
    init() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !this.ctx) {
          this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume();
        }
      } catch (e) {}
    },
    playTone(freq, duration, type = "sine", gainVal = 0.15) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch {}
    },
    playCorrect() {
      if (!this.enabled) return;
      this.init();
      // Hợp âm 3 nốt vui tươi (E5, G#5, B5)
      setTimeout(() => this.playTone(659.25, 0.18, "triangle", 0.18), 0);
      setTimeout(() => this.playTone(830.61, 0.22, "triangle", 0.18), 90);
      setTimeout(() => this.playTone(987.77, 0.35, "sine", 0.22), 180);
    },
    playWrong() {
      if (!this.enabled) return;
      this.init();
      // Hai âm điềm tĩnh, nhẹ nhàng (G4, D4)
      setTimeout(() => this.playTone(392.00, 0.14, "sine", 0.12), 0);
      setTimeout(() => this.playTone(329.63, 0.20, "sine", 0.12), 110);
    },
    playFanfare() {
      if (!this.enabled) return;
      this.init();
      // Giai điệu chiến thắng (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 0.28, "triangle", 0.2), idx * 110);
      });
    },
    playClick() {
      if (!this.enabled) return;
      this.playTone(850, 0.04, "sine", 0.04);
    },
    toggle() {
      this.enabled = !this.enabled;
      try {
        const store = JSON.parse(localStorage.getItem("aicheck:gamification") || "{}");
        store.soundEnabled = this.enabled;
        localStorage.setItem("aicheck:gamification", JSON.stringify(store));
      } catch {}
      window.dispatchEvent(new CustomEvent("aicheck:sound-toggle", { detail: { enabled: this.enabled } }));
      return this.enabled;
    }
  };
  window.AICheckAudio = AICheckAudio;

  // ==========================================================================
  // B. GAMIFICATION ENGINE (Điểm thưởng XP, Cấp độ, Chuỗi Streak & Huy hiệu)
  // ==========================================================================
  const AICheckGamification = {
    LEVELS: [
      { level: 1, title: "Tập Sự Kiểm Chứng", titleEn: "Apprentice Fact-Checker", minXp: 0, icon: "🌱" },
      { level: 2, title: "Trinh Thám Tin Tức", titleEn: "News Detective", minXp: 150, icon: "🔍" },
      { level: 3, title: "Chuyên Viên Phản Biện", titleEn: "Critical Specialist", minXp: 400, icon: "⚡" },
      { level: 4, title: "Thợ Săn Ảo Giác AI", titleEn: "AI Hallucination Hunter", minXp: 800, icon: "🛡️" },
      { level: 5, title: "Bậc Thầy Sự Thật THĐ", titleEn: "THD Truth Master", minXp: 1500, icon: "👑" }
    ],
    getData() {
      try {
        const data = JSON.parse(localStorage.getItem("aicheck:gamification"));
        if (data && typeof data.xp === "number") return data;
      } catch {}
      return {
        xp: 0,
        streak: 0,
        bestStreak: 0,
        lastLoginDate: null,
        soundEnabled: true,
        badges: [],
        roundsCompleted: 0,
        assessmentsCompleted: 0
      };
    },
    saveData(data) {
      try {
        localStorage.setItem("aicheck:gamification", JSON.stringify(data));
        window.dispatchEvent(new CustomEvent("aicheck:gamify-change", { detail: data }));
        if (window.AICheckCloud?.syncGamification) {
          window.AICheckCloud.syncGamification(data);
        }
      } catch {}
    },
    restoreFromCloud(cloudData) {
      if (!cloudData || typeof cloudData !== "object") return;
      const local = this.getData();
      const merged = {
        xp: Math.max(local.xp || 0, Number(cloudData.xp) || 0),
        streak: Number(cloudData.streak) || local.streak || 0,
        bestStreak: Math.max(local.bestStreak || 0, Number(cloudData.bestStreak) || 0),
        lastLoginDate: cloudData.lastLoginDate || local.lastLoginDate || null,
        soundEnabled: typeof cloudData.soundEnabled === "boolean" ? cloudData.soundEnabled : (local.soundEnabled !== false),
        badges: Array.from(new Set([...(local.badges || []), ...(cloudData.badges || [])])),
        roundsCompleted: Math.max(local.roundsCompleted || 0, Number(cloudData.roundsCompleted) || 0),
        assessmentsCompleted: Math.max(local.assessmentsCompleted || 0, Number(cloudData.assessmentsCompleted) || 0)
      };
      try {
        localStorage.setItem("aicheck:gamification", JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("aicheck:gamify-change", { detail: merged }));
      } catch {}
    },
    getLocalDateString(date = new Date()) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    getDaysDifference(d1, d2) {
      if (!d1 || !d2) return 999;
      const [y1, m1, day1] = d1.split("-").map(Number);
      const [y2, m2, day2] = d2.split("-").map(Number);
      const utc1 = Date.UTC(y1, m1 - 1, day1);
      const utc2 = Date.UTC(y2, m2 - 1, day2);
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.round((utc2 - utc1) / msPerDay);
    },
    checkDailyLoginStreak(user) {
      // Yêu cầu: Bắt buộc đăng nhập mới được cộng chuỗi ngày
      if (!user) return { streak: 0, checked: false };
      const today = this.getLocalDateString();
      const data = this.getData();
      
      // Nếu hôm nay đã ghi nhận chuỗi rồi, giữ nguyên
      if (data.lastLoginDate === today) {
        return { streak: data.streak || 1, checked: false, alreadyCheckedToday: true };
      }

      const lastDate = data.lastLoginDate;
      const diff = lastDate ? this.getDaysDifference(lastDate, today) : null;
      let addedXp = 0;
      let toastType = "starter";

      if (!lastDate || diff === null) {
        // Lần đầu đăng nhập: bắt đầu chuỗi ngày 1
        data.streak = 1;
        data.bestStreak = Math.max(data.bestStreak || 0, 1);
        data.lastLoginDate = today;
        addedXp = 30;
        toastType = "starter";
      } else if (diff === 1) {
        // Đăng nhập ngày kế tiếp liên tục: chuỗi + 1
        data.streak = (data.streak || 0) + 1;
        data.bestStreak = Math.max(data.bestStreak || 0, data.streak);
        data.lastLoginDate = today;
        const streakBonus = data.streak >= 7 ? 25 : (data.streak >= 3 ? 15 : 0);
        addedXp = 35 + streakBonus;
        toastType = "maintained";
      } else if (diff > 1) {
        // Gián đoạn >= 2 ngày: reset chuỗi về 1
        data.streak = 1;
        data.lastLoginDate = today;
        addedXp = 20;
        toastType = "reset";
      } else {
        // Ngày máy lùi
        data.lastLoginDate = today;
        return { streak: data.streak, checked: false };
      }

      data.xp = (data.xp || 0) + addedXp;
      if (!Array.isArray(data.badges)) data.badges = [];
      if (!data.badges.includes("login_day1")) data.badges.push("login_day1");
      if (data.streak >= 3 && !data.badges.includes("streak_3_days")) data.badges.push("streak_3_days");
      if (data.streak >= 7 && !data.badges.includes("streak_7_days")) data.badges.push("streak_7_days");

      this.saveData(data);
      this.showDailyStreakToast({
        streak: data.streak,
        xp: addedXp,
        type: toastType,
        bestStreak: data.bestStreak
      });

      window.AICheckAudio?.playCorrect();
      this.triggerMiniConfetti();

      return { streak: data.streak, addedXp, checked: true, type: toastType };
    },
    showDailyStreakToast({ streak, xp, type, bestStreak }) {
      const isEn = (window.AICheckI18n && window.AICheckI18n.getLang ? window.AICheckI18n.getLang() === "en" : false);
      let title = "";
      let subtitle = "";
      if (type === "starter") {
        title = isEn ? "🔥 Day 1 Login Streak!" : "🔥 Khởi Đầu Chuỗi Ngày Đăng Nhập!";
        subtitle = isEn ? `Welcome! You earned +${xp} XP. Log in tomorrow to keep the flame burning!` : `Chào mừng em! Nhận +${xp} XP. Hãy đăng nhập mỗi ngày để giữ vững chuỗi nhé!`;
      } else if (type === "maintained") {
        title = isEn ? `🔥 ${streak}-Day Login Streak!` : `🔥 Chuỗi ${streak} Ngày Liên Tiếp!`;
        subtitle = isEn ? `Awesome persistence! You earned +${xp} XP today. (Record: ${bestStreak} days)` : `Rất xuất sắc! Em nhận được +${xp} XP hôm nay. (Kỷ lục: ${bestStreak} ngày)`;
      } else {
        title = isEn ? "🔥 Login Streak Restarted!" : "🔥 Khởi Động Lại Chuỗi Ngày!";
        subtitle = isEn ? `Streak reset to Day 1 (+${xp} XP). Remember to log in daily!` : `Chuỗi bắt đầu lại: 1 Ngày (+${xp} XP). Hãy nhớ đăng nhập mỗi ngày nhé!`;
      }

      const existing = document.getElementById("dailyStreakToast");
      if (existing) existing.remove();

      const toast = document.createElement("div");
      toast.id = "dailyStreakToast";
      toast.className = "daily-streak-toast";
      toast.innerHTML = `
        <div class="streak-toast-icon">🔥</div>
        <div class="streak-toast-body">
          <div class="streak-toast-title">${title}</div>
          <div class="streak-toast-desc">${subtitle}</div>
        </div>
        <button type="button" class="streak-toast-close" aria-label="Close">✕</button>
      `;
      document.body.appendChild(toast);
      toast.querySelector(".streak-toast-close")?.addEventListener("click", () => {
        toast.classList.remove("is-visible");
        setTimeout(() => toast.remove(), 250);
      });
      setTimeout(() => toast.classList.add("is-visible"), 50);
      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.remove("is-visible");
          setTimeout(() => toast.remove(), 350);
        }
      }, 5000);
    },
    getStats() {
      const data = this.getData();
      let currentLevel = this.LEVELS[0];
      let nextLevel = this.LEVELS[1] || null;
      for (let i = this.LEVELS.length - 1; i >= 0; i--) {
        if (data.xp >= this.LEVELS[i].minXp) {
          currentLevel = this.LEVELS[i];
          nextLevel = this.LEVELS[i + 1] || null;
          break;
        }
      }
      const currentMin = currentLevel.minXp;
      const nextMin = nextLevel ? nextLevel.minXp : currentMin + 1000;
      const progressPercent = Math.min(100, Math.max(0, Math.round(((data.xp - currentMin) / (nextMin - currentMin)) * 100)));
      const isEn = (window.AICheckI18n && window.AICheckI18n.getLang ? window.AICheckI18n.getLang() === "en" : false);
      return {
        xp: data.xp,
        streak: data.streak || 0,
        bestStreak: data.bestStreak || 0,
        lastLoginDate: data.lastLoginDate,
        level: currentLevel.level,
        levelTitle: isEn ? (currentLevel.titleEn || currentLevel.title) : currentLevel.title,
        levelIcon: currentLevel.icon,
        nextLevelTitle: nextLevel ? (isEn ? (nextLevel.titleEn || nextLevel.title) : nextLevel.title) : (isEn ? "Max Level" : "Tối đa"),
        nextLevelXp: nextMin,
        progressPercent,
        badges: data.badges || [],
        soundEnabled: data.soundEnabled !== false
      };
    },
    addXp(pts, reason = "") {
      const data = this.getData();
      const oldStats = this.getStats();
      data.xp = Math.max(0, (data.xp || 0) + pts);
      this.saveData(data);
      const newStats = this.getStats();
      const leveledUp = newStats.level > oldStats.level;
      if (leveledUp) {
        window.AICheckAudio?.playFanfare();
        this.triggerConfetti();
        this.showLevelUpModal(newStats);
      }
      return { oldStats, newStats, leveledUp, added: pts };
    },
    recordPracticeAnswer(trustCorrect, methodCorrect) {
      const data = this.getData();
      const isBoth = Boolean(trustCorrect && methodCorrect);
      const isPartial = Boolean((trustCorrect && !methodCorrect) || (!trustCorrect && methodCorrect));
      
      let xpEarned = 0;
      if (isBoth) {
        xpEarned = 25; // Chuẩn hóa: Đúng cả 2 bước kiểm chứng: +25 XP
        if (!data.badges.includes("practice_first_both")) data.badges.push("practice_first_both");
        window.AICheckAudio?.playCorrect();
        this.triggerMiniConfetti();
      } else if (isPartial) {
        xpEarned = 10; // Đúng 1 bước: +10 XP
        window.AICheckAudio?.playCorrect();
      } else {
        xpEarned = 0; // Sai cả 2: 0 XP
        window.AICheckAudio?.playWrong();
      }

      if (xpEarned > 0) {
        data.xp = (data.xp || 0) + xpEarned;
        this.saveData(data);
        const stats = this.getStats();
        const oldLevel = Math.max(1, this.LEVELS.findIndex(l => (data.xp - xpEarned) < l.minXp));
        if (stats.level > oldLevel) {
          window.AICheckAudio?.playFanfare();
          this.triggerConfetti();
          this.showLevelUpModal(stats);
        }
      }

      return {
        isBothCorrect: isBoth,
        isPartial,
        trustCorrect,
        methodCorrect,
        xpEarned,
        totalXp: data.xp
      };
    },
    recordAnswer(isCorrect) {
      return this.recordPracticeAnswer(isCorrect, isCorrect);
    },
    completePracticeRound(correctCount, totalCount) {
      const data = this.getData();
      data.roundsCompleted = (data.roundsCompleted || 0) + 1;
      
      let bonusXp = 10;
      if (correctCount === totalCount) {
        bonusXp = 50; // Hoàn hảo 8/8
        if (!data.badges.includes("perfect_round")) data.badges.push("perfect_round");
      } else if (correctCount >= Math.round(totalCount * 0.75)) {
        bonusXp = 30; // Giỏi >= 75%
      } else if (correctCount >= Math.round(totalCount * 0.5)) {
        bonusXp = 20; // Đạt >= 50%
      }

      if (data.roundsCompleted >= 5 && !data.badges.includes("practice_veteran")) {
        data.badges.push("practice_veteran");
      }

      data.xp = (data.xp || 0) + bonusXp;
      this.saveData(data);

      if (correctCount >= Math.floor(totalCount / 2)) {
        window.AICheckAudio?.playFanfare();
        this.triggerConfetti();
      }

      return { bonusXp, perfect: correctCount === totalCount, roundsCompleted: data.roundsCompleted };
    },
    completeRound(correctCount, totalCount) {
      return this.completePracticeRound(correctCount, totalCount);
    },
    recordAssessmentResult({ mode, total, label, breakdown, phase }) {
      const data = this.getData();
      data.assessmentsCompleted = (data.assessmentsCompleted || 0) + 1;

      let baseXp = 0;
      let levelBonus = 0;
      let progressBonus = 0;

      if (mode === "assessment") {
        // Chuẩn hóa bài đánh giá 20 câu:
        // Base XP = Điểm Rubric đạt được (0 - 100 XP)
        baseXp = Math.max(0, Math.min(100, Math.round(total)));

        // Thưởng theo xếp loại Rubric
        if (label === "Giỏi" || total >= 76) {
          levelBonus = 100;
          if (!data.badges.includes("rubric_master")) data.badges.push("rubric_master");
        } else if (label === "Khá" || total >= 51) {
          levelBonus = 50;
          if (!data.badges.includes("rubric_good")) data.badges.push("rubric_good");
        } else if (label === "Trung bình" || total >= 26) {
          levelBonus = 25;
        } else {
          levelBonus = 15;
        }

        if (phase === "post") {
          progressBonus = 30;
        }
      } else {
        // Thử thách Rubric 5 câu:
        baseXp = Math.round(total * 0.5); // 0 - 50 XP
        levelBonus = total >= 80 ? 30 : 15;
      }

      const totalEarned = baseXp + levelBonus + progressBonus;
      const oldStats = this.getStats();
      data.xp = (data.xp || 0) + totalEarned;
      this.saveData(data);
      const newStats = this.getStats();

      if (total >= 70) {
        window.AICheckAudio?.playFanfare();
        this.triggerConfetti();
      } else {
        window.AICheckAudio?.playCorrect();
      }

      if (newStats.level > oldStats.level) {
        setTimeout(() => this.showLevelUpModal(newStats), 600);
      }

      return {
        baseXp,
        levelBonus,
        progressBonus,
        totalEarned,
        oldStats,
        newStats,
        label
      };
    },
    triggerConfetti() {
      if (typeof window.confetti === "function") {
        window.confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ["#d9f26c", "#24724f", "#e97850", "#3ec888", "#ffffff"]
        });
      } else {
        this.fallbackConfetti();
      }
    },
    triggerMiniConfetti() {
      if (typeof window.confetti === "function") {
        window.confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.7 },
          colors: ["#d9f26c", "#3ec888", "#ffffff"]
        });
      }
    },
    fallbackConfetti() {
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
      document.body.appendChild(container);
      for (let i = 0; i < 35; i++) {
        const p = document.createElement("div");
        const colors = ["#d9f26c", "#24724f", "#e97850", "#3ec888", "#ffffff"];
        const col = colors[Math.floor(Math.random() * colors.length)];
        const x = 30 + Math.random() * 40;
        const size = 6 + Math.random() * 8;
        p.style.cssText = `position:absolute;left:${x}%;bottom:20%;width:${size}px;height:${size}px;background:${col};border-radius:2px;transform:translate(0,0);opacity:1;transition:all 0.9s cubic-bezier(0.25, 1, 0.5, 1);`;
        container.appendChild(p);
        setTimeout(() => {
          const dx = (Math.random() - 0.5) * 360;
          const dy = -(150 + Math.random() * 320);
          const rot = (Math.random() - 0.5) * 720;
          p.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
          p.style.opacity = "0";
        }, 20);
      }
      setTimeout(() => container.remove(), 1100);
    },
    showLevelUpModal(stats) {
      const isEn = (window.AICheckI18n && window.AICheckI18n.getLang ? window.AICheckI18n.getLang() === "en" : false);
      const modal = document.createElement("div");
      modal.className = "gamify-levelup-modal";
      modal.innerHTML = `
        <div class="gamify-levelup-card">
          <div class="gamify-levelup-icon">${stats.levelIcon}</div>
          <h3>${isEn ? "CONGRATULATIONS ON LEVELING UP!" : "CHÚC MỪNG LÊN CẤP!"}</h3>
          <p class="gamify-levelup-title">${isEn ? `You have leveled up to <strong>Level ${stats.level}: ${stats.levelTitle}</strong>` : `Em đã xuất sắc thăng hạng lên <strong>Cấp ${stats.level}: ${stats.levelTitle}</strong>`}</p>
          <p class="gamify-levelup-xp">${isEn ? `Total accumulated experience points: <strong>${stats.xp} XP</strong>` : `Tổng điểm kinh nghiệm tích lũy: <strong>${stats.xp} XP</strong>`}</p>
          <button type="button" class="button button-lime" id="btnCloseLevelUp">${isEn ? "Awesome! Continue training →" : "Tuyệt vời! Tiếp tục rèn luyện →"}</button>
        </div>
      `;
      document.body.appendChild(modal);
      setTimeout(() => modal.classList.add("is-visible"), 10);
      modal.querySelector("#btnCloseLevelUp").addEventListener("click", () => {
        modal.classList.remove("is-visible");
        setTimeout(() => modal.remove(), 320);
      });
    }
  };
  window.AICheckGamification = AICheckGamification;

  // Khởi tạo trạng thái âm thanh từ bộ nhớ
  const initialGamify = AICheckGamification.getData();
  if (typeof initialGamify.soundEnabled === "boolean") {
    AICheckAudio.enabled = initialGamify.soundEnabled;
  }

  // ==========================================================================
  // C. HEADER RIGHT TOOLBAR, I18N SYSTEM & HAMBURGER NAVIGATION
  // ==========================================================================
  function getHeaderRight() {
    const headerInner = document.querySelector(".header-inner");
    if (!headerInner) return null;
    let right = headerInner.querySelector(".header-right");
    if (!right) {
      right = document.createElement("div");
      right.className = "header-right";
      const navToggle = headerInner.querySelector(".nav-toggle");
      if (navToggle) {
        headerInner.insertBefore(right, navToggle);
        right.appendChild(navToggle);
      } else {
        headerInner.appendChild(right);
      }
    }
    return right;
  }

  // 1. HỆ THỐNG ĐA NGÔN NGỮ (VIETNAMESE & ENGLISH)
  const AICheckI18n = {
    currentLang: "vi",
    dict: {
      vi: {
        brandSub: "TRẠM KIỂM CHỨNG THÔNG TIN",
        menuTitle: "MENU ĐIỀU HƯỚNG",
        menuSubtitle: "HỆ THỐNG KIỂM CHỨNG AI · THPT TRẦN HƯNG ĐẠO",
        menuOpen: "Mở menu điều hướng",
        menuClose: "Đóng menu điều hướng",
        login: "Đăng nhập ↗",
        logout: "Đăng xuất",
        logoutConfirm: "Bạn có chắc muốn đăng xuất?",
        guest: "Khách",
        member: "Thành viên",
        profileSettings: "Tùy chỉnh thông tin cá nhân",
        profileSettingsGuest: "Tùy chỉnh thông tin (Khách)",
        adminPanel: "Quản trị",
        settings: "Cài đặt",
        backToTop: "Lên đầu trang",
        themeLight: "Chuyển sang giao diện Sáng",
        themeDark: "Chuyển sang giao diện Tối",
        level: "Cấp",
        nav_home: "Trang chủ",
        nav_home_desc: "Tổng quan & Bản đồ tư duy kiểm chứng",
        nav_knowledge: "Kiến thức",
        nav_knowledge_desc: "4 Chuyên đề cốt lõi & Nhận diện lỗi AI",
        nav_practice: "Thực hành",
        nav_practice_desc: "Huấn luyện tương tác & Bóc mẽ Deepfake",
        nav_assessment: "Đánh giá",
        nav_assessment_desc: "4 Bộ đề chuẩn hóa & Cấp chứng chỉ",
        nav_leaderboard: "BXH",
        nav_leaderboard_desc: "Bảng vinh danh & Thăng hạng XP toàn trường",
        nav_research: "Nghiên cứu",
        nav_research_desc: "Báo cáo KHKT & Khảo sát THPT Trần Hưng Đạo",
        nav_resources: "Tài nguyên",
        nav_resources_desc: "Cẩm nang học tập, Infographic & AI Tools",
        // Profile Modal
        profileModalTitle: "HỒ SƠ CÁ NHÂN",
        profileModalSubtitle: "Tùy chỉnh thông tin & bảo mật tài khoản",
        avatarLabel: "Ảnh đại diện (Avatar)",
        avatarChoose: "Chọn biểu tượng đại diện:",
        avatarUrlOr: "Hoặc dán URL ảnh trực tiếp:",
        studentInfo: "Thông tin học sinh",
        fullName: "Họ và tên",
        usernameEmail: "Tên đăng nhập / Email",
        schoolClass: "Lớp / Trường",
        mottoBio: "Châm ngôn / Câu nói yêu thích",
        securityHeading: "Bảo mật tài khoản",
        oldPass: "Mật khẩu cũ",
        newPass: "Mật khẩu mới",
        confirmNewPass: "Xác nhận mật khẩu mới",
        btnCancel: "Hủy",
        btnSave: "Lưu thay đổi",
        saving: "Đang lưu...",
        saveSuccess: "Đã cập nhật hồ sơ cá nhân thành công!"
      },
      en: {
        brandSub: "FACT-CHECKING STATION",
        menuTitle: "NAVIGATION MENU",
        menuSubtitle: "AI FACT-CHECKING SYSTEM · TRAN HUNG DAO HIGH SCHOOL",
        menuOpen: "Open Navigation Menu",
        menuClose: "Close Navigation Menu",
        login: "Log in ↗",
        logout: "Log out",
        logoutConfirm: "Are you sure you want to log out?",
        guest: "Guest",
        member: "Member",
        profileSettings: "Customize Profile Settings",
        profileSettingsGuest: "Customize Profile (Guest)",
        adminPanel: "Admin Panel",
        settings: "Settings",
        backToTop: "Back to top",
        themeLight: "Switch to Light Theme",
        themeDark: "Switch to Dark Theme",
        level: "Lv.",
        nav_home: "Home",
        nav_home_desc: "Overview & Fact-check Mindmap",
        nav_knowledge: "Knowledge",
        nav_knowledge_desc: "4 Core Modules & AI Hallucination",
        nav_practice: "Practice",
        nav_practice_desc: "Interactive Training & Deepfake",
        nav_assessment: "Assessment",
        nav_assessment_desc: "Standardized Tests & Certificate",
        nav_leaderboard: "Leaderboard",
        nav_leaderboard_desc: "Hall of Fame & Schoolwide Ranking",
        nav_research: "Research",
        nav_research_desc: "Scientific Report & THD Survey",
        nav_resources: "Resources",
        nav_resources_desc: "Handbook, Infographic & AI Tools",
        // Profile Modal
        profileModalTitle: "USER PROFILE",
        profileModalSubtitle: "Personal Information & Account Security",
        avatarLabel: "Profile Avatar",
        avatarChoose: "Choose an emoji avatar:",
        avatarUrlOr: "Or paste an image URL directly:",
        studentInfo: "Student Information",
        fullName: "Full Name",
        usernameEmail: "Username / Email",
        schoolClass: "Class / School",
        mottoBio: "Favorite Motto / Bio",
        securityHeading: "Account Security",
        oldPass: "Current Password",
        newPass: "New Password",
        confirmNewPass: "Confirm New Password",
        btnCancel: "Cancel",
        btnSave: "Save Changes",
        saving: "Saving...",
        saveSuccess: "Profile updated successfully!"
      }
    },
    // Từ điển song ngữ toàn trang (Full-page bilingual dictionary)
    pageDict: {
      // --- HEADER & BRAND ---
      "AI CHECK THĐ": "AI CHECK THD",
      "TRẠM KIỂM CHỨNG THÔNG TIN": "FACT-CHECKING STATION",
      "Đăng nhập ↗": "Log in ↗",
      "Đăng xuất": "Log out",
      "Quản trị": "Admin",
      "Thành viên": "Member",
      "Khách": "Guest",
      "Cài đặt": "Settings",
      "Lên đầu trang": "Back to top",
      "Cuộn lên đầu trang": "Scroll to top",
      "Chuyển sang giao diện Sáng": "Switch to Light Theme",
      "Chuyển sang giao diện Tối": "Switch to Dark Theme",
      "Cấp": "Lv.",
      "Cấp 1": "Lv.1",
      "Cấp 2": "Lv.2",
      "Cấp 3": "Lv.3",
      "Cấp 4": "Lv.4",
      "Cấp 5": "Lv.5",

      // --- TRANG CHỦ (INDEX.HTML) ---
      "THPT TRẦN HƯNG ĐẠO · NGHIÊN CỨU KHOA HỌC": "TRAN HUNG DAO HIGH SCHOOL · SCIENTIFIC RESEARCH",
      "AI có thể trả lời. Bạn cần biết cách kiểm chứng.": "AI can provide answers. You need to know how to fact-check.",
      " Không gian học tập giúp học sinh dừng lại, tìm bằng chứng và dùng thông tin AI có trách nhiệm.": " A learning space helping students pause, seek evidence, and responsibly use AI-generated information.",
      "Không gian học tập giúp học sinh dừng lại, tìm bằng chứng và dùng thông tin AI có trách nhiệm.": "A learning space helping students pause, seek evidence, and responsibly use AI-generated information.",
      "Không gian học tập giúp học sinh dừng lại, tìm bằng chứng và dùng thông tin do AI tạo có trách nhiệm.": "A learning space helping students pause, seek evidence, and responsibly use AI-generated information.",
      "AI có thể trả lời. Bạn cần biết cách kiểm chứng. Không gian học tập giúp học sinh dừng lại, tìm bằng chứng và dùng thông tin AI có trách nhiệm.": "AI can provide answers. You need to know how to fact-check. A learning space helping students pause, seek evidence, and responsibly use AI-generated information.",
      "Vào Đấu trường 60 Tình huống ⚡": "Enter 60 Scenarios Arena ⚡",
      "Vào Đấu trường 60 Tình huống →": "Enter 60 Scenarios Arena →",
      "Quy trình 5 bước →": "5-Step Process →",
      "Đừng tin ngay – Hãy kiểm chứng trước khi sử dụng.": "Do not believe blindly – Always verify before using.",
      "Khuyến cáo: Hãy kiểm chứng trước khi tin và chia sẻ thông tin từ AI.": "Notice: Always verify evidence before believing and sharing AI-generated claims.",
      
      // Bento Profile Strip
      "Chào bạn, Chiến binh Kiểm Chứng THĐ!": "Hello, THD Fact-Checking Warrior!",
      "Khởi động ngay để tích lũy điểm kinh nghiệm và thăng hạng.": "Start now to earn XP and level up.",
      "Luyện ngay →": "Practice Now →",
      "🌱 Lv.1 Tập Sự": "🌱 Lv.1 Apprentice",
      "⭐ 0 XP": "⭐ 0 XP",
      "0 Chuỗi": "0 Streak",
      
      // Metrics Strip
      "TÌNH HUỐNG THỰC CHIẾN": "REAL-WORLD SCENARIOS",
      "BƯỚC QUY TRÌNH CHUẨN": "STANDARD PROCESS STEPS",
      "TIÊU CHÍ RUBRIC NĂNG LỰC": "COMPETENCY RUBRIC CRITERIA",
      "HỌC SINH THPT TRẦN HƯNG ĐẠO": "TRAN HUNG DAO HIGH SCHOOL STUDENTS",
      "Tình huống thực tế": "Real Scenarios",
      "Học sinh THĐ tham gia": "THD Students Enrolled",
      "Câu hỏi trắc nghiệm": "Quiz Questions",
      "Chuyên đề cốt lõi": "Core Modules",

      // Portal Heading
      "CHỌN TRẠM": "SELECT STATION",
      "Đi thẳng đến nội dung bạn cần.": "Go directly to what you need.",
      "Mỗi khu vực là một trạm chức năng chuyên biệt, có thể mở trực tiếp và quay lại trang chủ từ thanh menu.": "Each area is a specialized functional station, accessible directly from the menu.",
      "HỌC · THỬ · ĐO · VINH DANH": "LEARN · PRACTICE · ASSESS · RANK",
      "HỆ THỐNG PHÂN HỆ": "SYSTEM MODULES",
      "CỔNG HỌC TẬP & ĐÁNH GIÁ": "LEARNING & ASSESSMENT PORTAL",
      "Chọn phân hệ để bắt đầu trải nghiệm toàn diện hệ thống kiểm chứng thông tin.": "Select a module to start your comprehensive AI fact-checking experience.",

      // Bento Cards
      "01 / HỌC KIẾN THỨC": "01 / LEARN KNOWLEDGE",
      "01 / HỌC": "01 / LEARN",
      "Kiến thức & 5 bước ↗": "Knowledge & 5 Steps ↗",
      "Kiến thức & 5 bước": "Knowledge & 5 Steps",
      "Nhận diện 4 loại rủi ro thông tin và làm chủ quy trình 5 bước kiểm chứng AI chuẩn quốc tế.": "Identify 4 information risks and master the international 5-step AI verification process.",
      "Nhận diện 5 rủi ro và thực hành quy trình kiểm chứng 5 bước.": "Identify 5 major risks and apply the 5-step verification process.",
      "BẮT ĐẦU HỌC →": "START LEARNING →",

      "02 / ĐẤU TRƯỜNG THỰC HÀNH": "02 / PRACTICE ARENA",
      "02 / LUYỆN": "02 / PRACTICE",
      "Thực hành 60 Tình huống ↗": "Practice 60 Scenarios ↗",
      "Thực hành 60 Tình huống": "Practice 60 Scenarios",
      "Luyện tập ngẫu nhiên với kho 60 câu hỏi Học tập, Đời sống, AI. Tích lũy XP, chuỗi Streak và nổ Confetti.": "Randomized practice with 60 questions across Academics, Life, and AI. Earn XP, Streaks, and Confetti.",
      "Thực hành 60 tình huống nhận diện ảo giác AI và thông tin sai lệch.": "Practice 60 scenarios identifying AI hallucinations and disinformation.",
      "VÀO ĐẤU TRƯỜNG →": "ENTER ARENA →",

      "03 / ĐO LƯỜNG": "03 / MEASUREMENT",
      "03 / ĐO": "03 / ASSESS",
      "Đánh giá & Rubric ↗": "Assessment & Rubric ↗",
      "Đánh giá & Rubric": "Assessment & Rubric",
      "Làm bài khảo sát 20 câu hỏi đo lường năng lực phản biện, chấm điểm tự động theo rubric 4 cấp độ.": "Complete 20-question survey measuring critical thinking, scored automatically across 4 rubric levels.",
      "Bộ đề 20 câu chuẩn hóa đánh giá năng lực kiểm chứng thông tin.": "20-question standardized test assessing verification proficiency.",
      "LÀM BÀI KHẢO SÁT →": "TAKE ASSESSMENT →",

      "04 / VINH DANH": "04 / HALL OF FAME",
      "04 / ĐUA": "04 / RANK",
      "Bảng xếp hạng THĐ ↗": "THD Leaderboard ↗",
      "Bảng xếp hạng THĐ": "THD Leaderboard",
      "Bảng vàng vinh danh những cá nhân xuất sắc nhất trong các lượt luyện tập và bài đo năng lực toàn trường.": "Honoring top individuals in practice rounds and schoolwide competency tests.",
      "Vinh danh Top học sinh có điểm số và tốc độ kiểm chứng xuất sắc.": "Hall of Fame honoring top students with superior accuracy and speed.",
      "XEM BẢNG VÀNG →": "VIEW LEADERBOARD →",

      "05 / NGHIÊN CỨU": "05 / RESEARCH",
      "05 / ĐỌC": "05 / RESEARCH",
      "Kết quả & Đề tài KHKT ↗": "Results & Science Project ↗",
      "Kết quả & Đề tài KHKT": "Results & Science Project",
      "Xem dữ liệu phân tích khoa học, số lượng người tham gia thực tế và sự chuyển biến trước – sau can thiệp.": "View scientific data analysis, participant counts, and pre-/post-intervention progress.",
      "Khảo sát thực trạng học sinh THĐ và cơ sở khoa học của dự án.": "Survey findings of THD students and the project's scientific foundation.",
      "XEM BÁO CÁO →": "VIEW REPORT →",

      "06 / TÀI NGUYÊN": "06 / RESOURCES",
      "06 / TẢI": "06 / RESOURCES",
      "Forms, Infographic & Video ↗": "Forms, Infographics & Video ↗",
      "Forms, Infographic & Video": "Forms, Infographics & Video",
      "Tải về cẩm nang bỏ túi, infographic infographic khổ lớn và kết nối tài nguyên truyền thông đề tài.": "Download pocket guides, large-format infographics, and media assets.",
      "Cẩm nang hướng dẫn, infographic và tài liệu hỗ trợ học tập.": "Handbook guides, infographics, and learning support materials.",
      "XEM TÀI NGUYÊN →": "VIEW RESOURCES →",

      // About Section
      "VỀ DỰ ÁN": "ABOUT THE PROJECT",
      "Đừng chỉ đọc câu trả lời. Hãy kiểm tra bằng chứng.": "Don't just read answers. Verify the evidence.",
      "AI CHECK THĐ là trạm học tập thuộc đề tài nâng cao năng lực kiểm chứng thông tin do AI cung cấp cho học sinh THPT Trần Hưng Đạo. Dự án giúp học sinh nhận diện rủi ro, truy tìm nguồn và đánh giá thông tin trước khi sử dụng.": "AI CHECK THD is a learning station under the science research project to enhance AI fact-checking competency for Tran Hung Dao High School students. It helps students identify risks, trace origins, and verify information before use.",
      "Tìm hiểu đề tài và phương pháp ↗": "Learn about research & methodology ↗",
      "Mục tiêu": "Objective",
      "Rèn thói quen kiểm chứng thông tin AI bằng quy trình rõ ràng.": "Cultivate AI fact-checking habits through a clear, systematic process.",
      "Cách học": "How to Learn",
      "Học 5 bước, luyện tình huống và tự đánh giá năng lực.": "Learn 5 steps, practice real scenarios, and self-assess competencies.",
      "Công cụ": "Tools",
      "Website học tập; không thay thế nguồn gốc hay chuyên gia.": "A learning platform; does not replace primary sources or expert consensus.",

      // FAQ Section
      "GIẢI ĐÁP NHANH": "QUICK FAQ",
      "Câu hỏi thường gặp.": "Frequently Asked Questions.",
      "Một vài điều cần biết trước khi bắt đầu.": "A few things to know before getting started.",
      "AI CHECK THĐ có phải là một chatbot AI không?": "Is AI CHECK THD an AI chatbot?",
      "Không. Đây là website học tập và thực hành kỹ năng kiểm chứng thông tin do AI cung cấp; website không đưa ra câu trả lời thay cho việc tra cứu nguồn.": "No. This is an educational platform to practice AI fact-checking skills; it does not replace original source verification.",
      "Bắt đầu học và luyện tập như thế nào?": "How do I start learning and practicing?",
      "Đọc quy trình 5 bước trong mục Kiến thức, sau đó luyện các tình huống trong mục Thực hành. Em có thể làm bài đánh giá để xem kết quả theo kỹ năng.": "Read the 5-step process in Knowledge, then practice scenarios in Practice. You can take the assessment to evaluate your skills.",
      "Tình huống trong phần thực hành có phải trích dẫn thật không?": "Are practice scenarios real quotes?",
      "Các tình huống mô phỏng dùng để luyện tập. Hãy mở phần giải thích và truy cập nguồn đối chiếu trước khi dùng một thông tin ngoài đời thực.": "Scenarios are simulated for educational practice. Always review explanations and cross-check primary sources before using claims in real life.",
      "Ai thực hiện đề tài và website lưu dữ liệu ở đâu?": "Who created this project and where is data stored?",
      "Danh sách thành viên và giáo viên hướng dẫn được cập nhật tại mục Nghiên cứu khi có xác nhận chính thức. Một số kết quả học tập được lưu trên trình duyệt hoặc đồng bộ theo cấu hình của dự án; xem thông báo tại từng công cụ trước khi sử dụng.": "Project members and advisors are updated in Research upon official confirmation. Learning progress is stored locally or synced based on configuration.",

      // Home Footer & QR
      "AI CHECK THĐ · Sản phẩm phục vụ nghiên cứu khoa học · THPT Trần Hưng Đạo": "AI CHECK THD · Scientific Research Project · Tran Hung Dao High School",
      "👤 Tài khoản": "👤 Account",
      "QUÉT ĐỂ TRUY CẬP WEBSITE": "SCAN TO ACCESS WEBSITE",
      "Bản đồ tư duy kiểm chứng thông tin AI": "AI Fact-Checking Mindmap",
      "Quét mã để truy cập nhanh trên điện thoại": "Scan QR code for quick mobile access",
      "Kiểm tra năng lực ngay →": "Test Your Skills Now →",
      "Bạn đã sẵn sàng kiểm chứng thông tin AI?": "Ready to test your AI fact-checking skills?",

      // --- KIẾN THỨC (KNOWLEDGE.HTML) ---
      "AI có thể sai không?": "Can AI Be Wrong?",
      "Có. Câu trả lời trôi chảy chưa phải bằng chứng. Nhận diện năm rủi ro, rồi dùng quy trình năm bước để kiểm tra thông tin quan trọng.": "Yes. Fluent answers are not evidence. Identify five risks, then use the five-step process to verify critical information.",
      "KIẾN THỨC · QUY TRÌNH": "KNOWLEDGE · PROCESS",
      "NHẬN DIỆN": "IDENTIFY",
      "5 rủi ro thường gặp": "5 Common Risks",
      "Nghe có vẻ hợp lý không đồng nghĩa với chính xác.": "Plausible does not mean accurate.",
      "01 · BỊA ĐẶT": "01 · FABRICATION",
      "Nghe thật, không có thật": "Sounds real, but isn't",
      "AI có thể tạo tên nghiên cứu, số liệu hoặc trích dẫn không tồn tại.": "AI can fabricate study names, numbers, or non-existent quotes.",
      "02 · SAI SỰ THẬT": "02 · FACTUAL ERROR",
      "Chi tiết không chính xác": "Inaccurate details",
      "Mốc thời gian, phép tính hay quan hệ nguyên nhân có thể bị nhầm.": "Timelines, math, or causal relationships can be flawed.",
      "03 · LỖI THỜI": "03 · OUTDATED",
      "Thông tin đã cũ": "Outdated information",
      "Câu trả lời có thể không cập nhật quy định, số liệu hoặc sự kiện mới.": "Answers may not reflect new regulations, statistics, or events.",
      "04 · NGUỒN ẢO": "04 · PHANTOM SOURCE",
      "Nguồn khó xác minh": "Hard-to-verify sources",
      "Tác giả, đường dẫn hay tài liệu AI nêu có thể không phù hợp hoặc không tồn tại.": "Authors, links, or documents cited may not exist.",
      "05 · PHA TRỘN": "05 · MIXED TRUTHS",
      "Đúng một phần": "Partially accurate",
      "Một đoạn có thể trộn dữ kiện đúng với kết luận sai hoặc thiếu căn cứ.": "A statement may blend true facts with unfounded conclusions.",
      "↗ Mở infographic “AI có thể sai không?”": "↗ Open Infographic “Can AI Be Wrong?”",
      "QUY TRÌNH": "PROCESS",
      "5 bước kiểm chứng thông tin AI": "5 Steps to Fact-Check AI Information",
      "Làm lần lượt trước khi tin hoặc chia sẻ.": "Follow sequentially before trusting or sharing.",
      "BƯỚC 01": "STEP 01",
      "DỪNG": "PAUSE",
      "Chưa vội tin, chia sẻ hay sao chép. Câu trả lời AI là điểm bắt đầu, chưa phải bằng chứng.": "Don't rush to trust, share, or copy. AI answers are starting points, not evidence.",
      "TẠM HOÃN KẾT LUẬN": "HOLD JUDGMENT",
      "BƯỚC 02": "STEP 02",
      "XÁC ĐỊNH": "IDENTIFY",
      "Gạch chân điều cần kiểm tra: con số, tên người, trích dẫn, mốc thời gian hoặc lời khuyên quan trọng.": "Underline what needs checking: numbers, names, quotes, dates, or vital advice.",
      "KHOANH VÙNG KHẲNG ĐỊNH": "ISOLATE CLAIMS",
      "BƯỚC 03": "STEP 03",
      "TÌM NGUỒN": "FIND SOURCES",
      "Tìm tài liệu gốc và nguồn có trách nhiệm như cơ quan chuyên môn, văn bản chính thức hoặc nghiên cứu rõ tác giả.": "Seek original documents and authoritative sources such as official agencies or peer-reviewed research.",
      "TRUY VẾT XUẤT XỨ": "TRACE ORIGINS",
      "BƯỚC 04": "STEP 04",
      "ĐỐI CHIẾU": "CROSS-CHECK",
      "So sánh nội dung, ngày công bố, phương pháp và ngữ cảnh với nguồn độc lập; xem các nguồn có cùng trích một nơi không.": "Compare content, publication dates, methods, and contexts with independent sources.",
      "KIỂM TRA BẰNG CHỨNG": "CHECK EVIDENCE",
      "BƯỚC 05": "STEP 05",
      "KẾT LUẬN": "CONCLUDE",
      "Chọn Đúng, Sai, Chưa đủ căn cứ hoặc Cần kiểm chứng thêm; nêu bằng chứng và giới hạn của nó.": "Select True, False, Insufficient Evidence, or Needs More Verification; cite evidence and limits.",
      "KẾT LUẬN CÓ CĂN CỨ": "GROUNDED CONCLUSION",
      "Không tìm thấy bằng chứng chưa đủ để khẳng định thông tin sai. Hãy kết luận đúng với chất lượng và phạm vi nguồn đã kiểm tra.": "Absence of evidence is not proof of falsehood. Conclude accurately based on the rigor and scope of checked sources.",
      "AI CHECK THĐ · THPT Trần Hưng Đạo": "AI CHECK THD · Tran Hung Dao High School",

      // --- THỰC HÀNH (PRACTICE.HTML) ---
      "02 / THỬ NGHIỆM THỰC CHIẾN": "02 / LIVE ARENA",
      "Check AI: Đấu trường 60 tình huống.": "Check AI: 60 Scenarios Arena.",
      "Mỗi thẻ đưa ra một phát biểu do AI cung cấp và nêu việc cần kiểm tra. Hãy đọc cả hai, chọn một kết luận cùng cách kiểm chứng phù hợp; hệ thống sẽ phân tích sư phạm và tính điểm kinh nghiệm ngay sau khi em trả lời.": "Each scenario presents an AI assertion and a verification task. Review both, select a conclusion with an appropriate method; pedagogical breakdown and XP are awarded instantly.",
      "60 TÌNH HUỐNG · 3 CHỦ ĐỀ": "60 SCENARIOS · 3 TOPICS",
      "🔊 Âm thanh: Bật": "🔊 Sound: On",
      "🔊 Âm thanh: Tắt": "🔊 Sound: Off",
      "Bật/Tắt âm thanh phản hồi": "Toggle feedback audio",
      "Tiến trình làm bài trong lượt": "Round progress",
      "CÂU 1 / 8": "QUESTION 1 / 8",
      "Câu hỏi tình huống": "Scenario Question",
      "Bước 1: Dựa trên phát biểu AI ở trên, em chọn kết luận nào?": "Step 1: Based on the AI statement above, which conclusion do you choose?",
      "Bước 2: Cách nào phù hợp nhất để kiểm chứng phát biểu này?": "Step 2: What is the most appropriate method to verify this statement?",
      "Chọn kết luận và cách kiểm chứng": "Select a conclusion and verification method",
      "Kiểm tra đáp án →": "Check Answer →",
      "Tình huống tiếp theo →": "Next Scenario →",
      "Xem phân tích": "View Analysis",
      "Xem phân tích chuyên gia": "View Expert Analysis",
      "Ví dụ bổ sung · Sức khỏe": "Additional Example · Health",
      "“Nước chanh chữa khỏi mọi bệnh cảm cúm trong một ngày.” Hãy đối chiếu hướng dẫn y tế.": "“Lemon water cures all colds in a single day.” Cross-check medical guidelines.",
      "Ví dụ bổ sung · Lịch sử": "Additional Example · History",
      "“Câu nói đang lan truyền chắc chắn là nguyên văn của nhân vật lịch sử.” Hãy tìm văn bản gốc.": "“The circulating quote is definitely the historical figure's exact words.” Search for the original text.",
      "LUYỆN TẬP THEO LƯỢT": "SESSION PRACTICE",
      "Mỗi lượt là một đề mới.": "Each round is a fresh set.",
      "Câu đã làm không lặp cho đến khi dùng hết kho 60 tình huống. Lượt cuối có thể ngắn hơn để giữ nguyên nguyên tắc đó.": "Answered questions will not repeat until all 60 scenarios are exhausted.",
      "Bắt đầu lượt mới ↻": "Start New Round ↻",
      "Mở Google Form ↗": "Open Google Form ↗",
      "Các tình huống là tư liệu mô phỏng cho hoạt động học tập, không phải trích dẫn nghiên cứu thật nếu chưa kèm nguồn.": "Scenarios are simulated for educational practice, not real citations unless accompanied by verified sources.",
      "Thư viện tình huống · 60 tình huống": "Scenario Library · 60 Scenarios",
      "Thư viện 60 tình huống kiểm chứng": "Library of 60 Fact-Checking Scenarios",
      "Chọn một thẻ để xem nhiệm vụ, nguồn đối chiếu, kết luận tham khảo và giải thích chi tiết.": "Select a card to view tasks, cross-check sources, reference conclusions, and detailed explanations.",
      "Bấm vào tình huống bất kỳ để mở rộng kiểm tra chi tiết hoặc luyện tập trực tiếp.": "Click any scenario to expand full analysis or practice directly.",
      "Tìm kiếm nhanh trong 60 tình huống (ví dụ: Deepfake, Fansipan, trà sữa, đề thi, AI...)": "Quick search across 60 scenarios (e.g., Deepfake, Fansipan, milk tea, exam, AI...)",
      "Tất cả · 60": "All · 60",
      "Học tập · 20": "Academics · 20",
      "Đời sống · 20": "Life · 20",
      "AI · 20": "AI · 20",
      "Tất cả": "All",
      "Chưa làm": "Unattempted",
      "Đã làm đúng": "Correct",
      "Cần ôn lại": "Needs Review",
      "Học tập": "Academics",
      "Đời sống": "Life",
      "Đúng": "True",
      "Sai": "False",
      "Chưa đủ căn cứ": "Insufficient Evidence",
      "Cần kiểm chứng thêm": "Needs Verification",
      "Bắt đầu làm bài": "Start Practice",

      // --- ĐÁNH GIÁ (ASSESSMENT.HTML) ---
      "03 / ĐO": "03 / ASSESS",
      "03 / ĐO LƯỜNG NĂNG LỰC": "03 / COMPETENCY ASSESSMENT",
      "Đánh giá năng lực kiểm chứng.": "AI Fact-Checking Competency Assessment.",
      "Đánh giá chuẩn hóa năng lực kiểm chứng": "Standardized Fact-Checking Competency Test",
      "Bài đo gồm 20 câu, chia đều cho năm kỹ năng. Câu hỏi được xáo ngẫu nhiên từ ngân hàng; mỗi đề có đủ 20 câu và hạn chế lặp lại câu của lượt trước.": "The assessment contains 20 questions evenly distributed across 5 skills. Questions are randomized from the item pool.",
      "Hệ thống 4 bộ đề kiểm tra trắc nghiệm 20 câu chuẩn hóa, phân loại theo độ khó và chuyên đề. Hoàn thành để nhận chứng nhận và điểm kinh nghiệm.": "A system of 4 standardized 20-question tests grouped by difficulty and topic. Complete tests to earn certificates and XP.",
      "4 BỘ ĐỀ · 20 CÂU / ĐỀ": "4 TEST SETS · 20 QUESTIONS EACH",
      "THANG ĐIỂM 100": "100-POINT SCALE",
      "Biệt danh trên BXH · không nhập tên thật": "Leaderboard Nickname · do not use real name",
      "Ví dụ: Sao Xanh 12A5": "e.g., BlueStar 12A5",
      "Lưu tên": "Save Name",
      "THPT TRẦN HƯNG ĐẠO · KHẢO SÁT NĂNG LỰC": "TRAN HUNG DAO HIGH SCHOOL · COMPETENCY SURVEY",
      "Chọn đợt đo để bắt đầu": "Select Assessment Phase to Begin",
      "Bài đo gồm 20 câu hỏi tình huống chia đều cho 5 kỹ năng. Chọn đúng giai đoạn của bạn để kết quả được lưu và đồng bộ chính xác vào đề tài nghiên cứu.": "The test has 20 scenario questions across 5 skills. Choose your phase to accurately record results for the research project.",
      "ĐỢT ĐO 01": "PHASE 01",
      "Khảo sát Trước can thiệp": "Pre-Intervention Survey",
      "Dành cho học sinh chưa tham gia tập huấn hoặc lần đầu làm bài đo.": "For students who have not yet participated in training or taking the test for the first time.",
      "Bắt đầu đo Trước can thiệp →": "Start Pre-Intervention Test →",
      "ĐỢT ĐO 02": "PHASE 02",
      "Khảo sát Sau can thiệp": "Post-Intervention Survey",
      "Dành cho học sinh đã học quy trình 5 bước và luyện tập trên website.": "For students who have completed the 5-step training and practiced on the site.",
      "Bắt đầu đo Sau can thiệp →": "Start Post-Intervention Test →",
      "Nộp bài đánh giá": "Submit Assessment",
      "Nộp bài thi": "Submit Test",
      "Thời gian làm bài:": "Time Remaining:",
      "Kết quả đánh giá": "Assessment Results",
      "Xem lại câu trước": "Review Previous Question",
      "Làm bài lại": "Retake Test",

      // --- BXH (LEADERBOARD.HTML) ---
      "04 / GHI NHẬN": "04 / RECORD",
      "04 / VINH DANH & THỨ HẠNG": "04 / HALL OF FAME & RANKINGS",
      "Bảng xếp hạng kỹ năng.": "Skill Leaderboard.",
      "Bảng vinh danh kiểm chứng THĐ": "THD Fact-Checking Hall of Fame",
      "Theo dõi thành tích cao nhất ở từng khu vực. Dùng cùng một trình duyệt để kết quả từ các trang được tổng hợp.": "Track top performance across categories. Use the same browser to aggregate progress.",
      "Bảng xếp hạng thành tích học sinh toàn trường dựa trên điểm kinh nghiệm (XP), chuỗi đúng và thời gian giải quyết thử thách.": "Schoolwide leaderboard based on XP points, correct answer streaks, and problem-solving speed.",
      "3 BẢNG RIÊNG": "3 SEPARATE BOARDS",
      "Biệt danh · không nhập tên thật": "Nickname · do not use real name",
      "Thử thách rubric": "Rubric Challenge",
      "Đánh giá năng lực": "Competency Assessment",
      "Tình huống": "Scenarios",
      "Cập nhật ↻": "Refresh ↻",
      "🥇 NHẤT": "🥇 1ST PLACE",
      "🥈 NHÌ": "🥈 2ND PLACE",
      "🥉 BA": "🥉 3RD PLACE",
      "HẠNG": "RANK",
      "TÊN HIỂN THỊ": "DISPLAY NAME",
      "NGÀY LÀM CAO NHẤT": "BEST RECORD DATE",
      "Chưa có người chơi": "No players yet",
      "Điểm": "Score",
      "Điểm tình huống": "Scenario Score",
      "AI CHECK THĐ · Bảng xếp hạng cục bộ": "AI CHECK THD · Local Leaderboard",
      "Hạng": "Rank",
      "Học sinh": "Student",
      "Lớp / Khối": "Class / Grade",
      "Cấp độ": "Level",
      "Điểm kinh nghiệm": "XP Points",
      "Chuỗi đúng": "Streak",
      "Toàn trường": "All School",
      "Khối 10": "Grade 10",
      "Khối 11": "Grade 11",
      "Khối 12": "Grade 12",

      // --- NGHIÊN CỨU (RESEARCH.HTML) ---
      "05 / NGHIÊN CỨU": "05 / RESEARCH",
      "05 / CƠ SỞ KHOA HỌC": "05 / SCIENTIFIC EVIDENCE",
      "Kết quả khảo sát tự động.": "Automated Survey Results.",
      "Báo cáo nghiên cứu & Khảo sát THĐ": "Scientific Research Report & THD Survey",
      "Theo dõi kết quả bài đánh giá và phân bố câu trả lời Google Forms; dữ liệu Form được làm mới định kỳ.": "Track assessment results and Google Forms distribution; Form data is refreshed periodically.",
      "Kết quả khảo sát 600 học sinh THPT Trần Hưng Đạo về thói quen sử dụng AI, mức độ phụ thuộc và hiệu quả của mô hình can thiệp.": "Survey findings of 600 students at Tran Hung Dao High School regarding AI habits, dependency rates, and intervention efficacy.",
      "Tải báo cáo toàn văn (PDF)": "Download Full Report (PDF)",
      "DỮ LIỆU TỔNG HỢP": "AGGREGATED DATA",
      "LẦN ĐO 01": "PHASE 01",
      "Trước can thiệp": "Pre-Intervention",
      "LẦN ĐO 02": "PHASE 02",
      "Sau can thiệp": "Post-Intervention",
      "Người tham gia": "Participants",
      "Điểm trung bình": "Average Score",
      "Đạt mức Khá/Giỏi": "Good/Excellent Rate",
      "Lượt làm": "Total Attempts",
      "So sánh điểm trung bình": "Average Score Comparison",
      "Trước": "Before",
      "Sau": "After",
      "GOOGLE FORMS": "GOOGLE FORMS",
      "Thống kê phản hồi khảo sát.": "Survey Feedback Statistics.",
      "Tổng số phản hồi và phân bố lựa chọn được tổng hợp từ Google Sheets.": "Total responses and option distributions aggregated from Google Sheets.",
      "LÀM MỚI MỖI 30 GIÂY": "REFRESH EVERY 30S",
      "Tổng phản hồi": "Total Responses",
      "Thông tin đề tài": "Project Information",
      "Tên đề tài": "Project Title",
      "“Thực trạng và giải pháp nâng cao năng lực kiểm chứng thông tin do trí tuệ nhân tạo (AI) cung cấp cho học sinh Trường THPT Trần Hưng Đạo”.": "“Current status and solutions to enhance AI fact-checking competency for students at Tran Hung Dao High School”.",
      "Lý do chọn đề tài": "Rationale",
      "AI ngày càng phổ biến trong học tập; học sinh cần biết đánh giá và kiểm chứng thông tin trước khi sử dụng.": "AI is increasingly prevalent in learning; students must learn to critically evaluate and verify AI claims before use.",
      "Mục tiêu & đối tượng": "Objectives & Subjects",
      "Khảo sát và nâng cao năng lực kiểm chứng thông tin AI của học sinh THPT.": "Survey and elevate AI fact-checking competency among high school students.",
      "Phương pháp": "Methodology",
      "Khảo sát, xây dựng công cụ và tình huống, tổ chức can thiệp, so sánh kết quả trước – sau.": "Survey, develop tools & scenarios, execute interventions, and compare pre- vs post-results.",
      "Sản phẩm": "Deliverables",
      "Bộ công cụ đánh giá; quy trình 5 bước; 30 tình huống; website, infographic và sổ tay.": "Evaluation toolset; 5-step workflow; 30 scenarios; web app, infographics, and handbook.",
      "Nhóm nghiên cứu · Giáo viên hướng dẫn": "Research Team & Advisors",
      "Cập nhật họ tên chính thức trước khi công bố.": "Updated with official names before public release.",
      "QR TRANG CHỦ": "HOMEPAGE QR",
      "Mã QR sẵn sàng khi website có địa chỉ công khai.": "QR code ready when website has a public URL.",
      "AI CHECK THĐ · Số liệu tổng hợp tự động từ bài đánh giá": "AI CHECK THD · Automated Summary from Assessments",

      // --- TÀI NGUYÊN (RESOURCES.HTML) ---
      "06 / TÀI NGUYÊN": "06 / RESOURCES",
      "06 / TÀI LIỆU & HỌC LIỆU": "06 / LEARNING RESOURCES",
      "Công cụ học và nguồn đối chiếu.": "Learning Tools & Verification Sources.",
      "Tài nguyên & Cẩm nang kiểm chứng": "Fact-Checking Resources & Handbook",
      "Google Form khảo sát đã được gắn sẵn bên dưới, infographic đề tài được đặt ngay sau biểu mẫu.": "The survey Google Form is embedded below, with the project infographic right after.",
      "Tải về infographic, cẩm nang 5 bước và các công cụ tra cứu thông tin phục vụ học tập và nghiên cứu.": "Download infographics, the 5-step handbook, and lookup tools designed for learning and research.",
      "TÀI LIỆU · BIỂU MẪU": "DOCUMENTS · FORMS",
      "Google Form khảo sát": "Survey Google Form",
      "BIỂU MẪU KHẢO SÁT AI CHECK THĐ": "AI CHECK THD SURVEY FORM",
      "Mở trong tab mới ↗": "Open in new tab ↗",
      "Infographic đề tài": "Project Infographic",
      "Thực trạng, rủi ro và giải pháp nâng cao năng lực kiểm chứng thông tin AI.": "Status quo, risks, and solutions to enhance AI fact-checking competency.",
      "Tải infographic ↓": "Download Infographic ↓",
      "Tải xuống": "Download",
      "Xem trực tuyến": "Preview Online",
      "CẨM NANG 5 BƯỚC ↗": "5-STEP HANDBOOK ↗",
      "Quy trình kiểm chứng và các dấu hiệu cần chú ý.": "Verification workflow and critical red flags to monitor.",
      "PHIẾU ĐÁNH GIÁ ↗": "ASSESSMENT RUBRIC ↗",
      "Bài đo năng lực 20 câu, rubric 100 điểm.": "20-question competency test, 100-point rubric.",
      "BỘ CÂU HỎI THỰC HÀNH ↗": "PRACTICE QUESTION SET ↗",
      "30 tình huống theo ba nhóm chủ đề.": "30 scenarios across three core topics.",
      "RUBRIC CHẤM ĐIỂM ↗": "SCORING RUBRIC ↗",
      "Tiêu chí, trọng số và bốn mức kết quả.": "Criteria, weights, and four achievement levels.",
      "AI CHECK THĐ · Tài nguyên cho học sinh và nhóm nghiên cứu": "AI CHECK THD · Resources for Students & Research Team",

      // --- USER PROFILE MODAL ---
      "Hồ Sơ Cá Nhân": "User Profile",
      "Tùy chỉnh thông tin học tập & bảo mật tài khoản": "Personal Information & Account Security",
      "Thông tin chung": "General Info",
      "Đổi mật khẩu": "Change Password",
      "Chọn ảnh đại diện:": "Choose avatar:",
      "Emoji hoặc tải ảnh riêng": "Emoji or upload image",
      "📁 Tải ảnh từ máy": "📁 Upload image",
      "🔗 Dán link ảnh": "🔗 Paste image link",
      "Áp dụng": "Apply",
      "Họ và tên / Biệt danh": "Full Name / Nickname",
      "Email / Tài khoản": "Email / Account",
      "(Chỉ đọc)": "(Read-only)",
      "Khách vãng lai": "Guest User",
      "Lớp học": "Class / Grade",
      "Trường học": "School",
      "Ngày sinh": "Birthdate",
      "Câu nói yêu thích / Châm ngôn (Motto)": "Favorite Motto / Bio",
      "Tối đa 160 ký tự. Sẽ lưu cùng hồ sơ học tập của em.": "Max 160 characters. Saved with your profile.",
      "Mật khẩu mới": "New Password",
      "Xác nhận mật khẩu mới": "Confirm New Password",
      "Tối thiểu 6 ký tự": "At least 6 characters",
      "Nhập lại mật khẩu mới": "Re-enter new password",
      "Hủy bỏ": "Cancel",
      "Lưu thay đổi": "Save Changes",

      // --- PLACEHOLDERS ---
      "Ví dụ: Nguyễn Văn An": "e.g., Alex Johnson",
      "Ví dụ: 12A5": "e.g., 12A5",
      "THPT Trần Hưng Đạo": "Tran Hung Dao High School",
      "Ví dụ: Kiểm chứng thông tin trước khi tin - Tư duy phản biện thời đại AI.": "e.g., Verify before trusting - Critical thinking in the AI era."
    },
    getSortedDict() {
      if (!this._sortedEntries) {
        this._sortedEntries = Object.entries(this.pageDict).sort((a, b) => b[0].length - a[0].length);
      }
      return this._sortedEntries;
    },
    t(key) {
      const lang = this.currentLang || "vi";
      return this.dict[lang]?.[key] || this.dict.vi[key] || key;
    },
    setLang(lang) {
      if (lang !== "vi" && lang !== "en") lang = "vi";
      this.currentLang = lang;
      try {
        localStorage.setItem("aicheck:lang", lang);
      } catch {}
      document.documentElement.setAttribute("data-lang", lang);
      document.documentElement.lang = lang;
      this.applyTranslations();
      window.dispatchEvent(new CustomEvent("aicheck:lang-change", { detail: { lang } }));
    },
    getLang() {
      try {
        const saved = localStorage.getItem("aicheck:lang");
        if (saved === "vi" || saved === "en") return saved;
      } catch {}
      return this.currentLang || "vi";
    },
    translatePageContent(lang) {
      const isEn = lang === "en";

      // 1. Dịch tiêu đề tài liệu trang (Document Title)
      if (isEn) {
        if (!document._origTitle) document._origTitle = document.title;
        document.title = document.title
          .replace("Trạm Kiểm Chứng Thông Tin 2026", "Fact-Checking Station 2026")
          .replace("Kiến thức & 5 bước", "Knowledge & 5 Steps")
          .replace("Luyện tập & Thực hành", "Practice & Training")
          .replace("Đánh giá chuẩn hóa", "Standardized Assessment")
          .replace("Đánh giá năng lực", "Competency Assessment")
          .replace("Bảng xếp hạng", "Leaderboard")
          .replace("Nghiên cứu khoa học", "Scientific Research")
          .replace("Nghiên cứu", "Research")
          .replace("Tài nguyên & Cẩm nang", "Resources & Handbook")
          .replace("Tài nguyên & Google Form", "Resources & Google Form")
          .replace("THĐ", "THD");
      } else if (document._origTitle) {
        document.title = document._origTitle;
      }

      // 2. Tiêu đề thương hiệu Header (.brand-name)
      const brandNameEl = document.querySelector(".brand-name");
      if (brandNameEl) {
        if (!brandNameEl.dataset.origHtml) {
          brandNameEl.dataset.origHtml = brandNameEl.innerHTML;
        }
        if (isEn) {
          brandNameEl.innerHTML = `AI CHECK THD<small>FACT-CHECKING STATION</small>`;
        } else {
          brandNameEl.innerHTML = brandNameEl.dataset.origHtml;
        }
      }

      // 3. Tiêu đề lớn Trang chủ (h1.home-title)
      const homeTitle = document.querySelector(".home-title");
      if (homeTitle) {
        if (!homeTitle.dataset.origHtml) homeTitle.dataset.origHtml = homeTitle.innerHTML;
        if (isEn) {
          homeTitle.innerHTML = `AI CHECK<br><span>THD.</span>`;
        } else {
          homeTitle.innerHTML = homeTitle.dataset.origHtml;
        }
      }

      // 4. TreeWalker quét TOÀN BỘ các nút văn bản (Text Nodes) trên trang
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          // Loại trừ controls chuyển đổi ngôn ngữ, theme switcher và các scripts/styles/drawer
          if (
            parent.closest("#headerLangToggle") ||
            parent.closest(".toggleWrapper") ||
            parent.closest("script") ||
            parent.closest("style") ||
            parent.closest(".site-loader-overlay") ||
            parent.closest("#siteNav") ||
            parent.classList.contains("brand-name") ||
            parent.classList.contains("home-title")
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      const textNodes = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }

      const sortedDict = this.getSortedDict();

      for (const node of textNodes) {
        // Lưu trữ văn bản gốc tiếng Việt lần đầu tiên
        if (typeof node._origVi !== "string") {
          node._origVi = node.nodeValue;
        }

        if (isEn) {
          const orig = node._origVi;
          const trimmed = orig.trim();
          const normalized = trimmed.replace(/\s+/g, " ");

          // 4a. Khớp chính xác 100% từ điển
          const exactMatch = this.pageDict[trimmed] || this.pageDict[normalized];
          if (exactMatch) {
            const leading = orig.match(/^\s*/)[0];
            const trailing = orig.match(/\s*$/)[0];
            node.nodeValue = leading + exactMatch + trailing;
          } else {
            // 4b. Khớp cụm từ theo độ dài giảm dần (Longest-First)
            let result = orig;
            let replaced = false;
            for (let i = 0; i < sortedDict.length; i++) {
              const viKey = sortedDict[i][0];
              const enVal = sortedDict[i][1];
              if (viKey.length >= 3 && result.includes(viKey)) {
                result = result.split(viKey).join(enVal);
                replaced = true;
              }
            }

            // 4c. Xử lý các chuỗi động (Cấp độ, Chuỗi, Câu hỏi)
            if (result.includes("Tập Sự")) { result = result.replace("Tập Sự", "Apprentice"); replaced = true; }
            if (result.includes("Trinh Thám Tin Tức")) { result = result.replace("Trinh Thám Tin Tức", "News Detective"); replaced = true; }
            if (result.includes("Chuyên Viên Phản Biện")) { result = result.replace("Chuyên Viên Phản Biện", "Critical Specialist"); replaced = true; }
            if (result.includes("Thợ Săn Ảo Giác AI")) { result = result.replace("Thợ Săn Ảo Giác AI", "AI Hallucination Hunter"); replaced = true; }
            if (result.includes("Bậc Thầy Sự Thật THĐ")) { result = result.replace("Bậc Thầy Sự Thật THĐ", "THD Truth Master"); replaced = true; }
            if (result.includes("Chuỗi")) { result = result.replace("Chuỗi", "Streak"); replaced = true; }
            if (result.startsWith("CÂU ") && result.includes("/")) { result = result.replace("CÂU", "QUESTION"); replaced = true; }

            if (replaced) {
              node.nodeValue = result;
            }
          }
        } else {
          // Khôi phục 100% nguyên trạng tiếng Việt
          node.nodeValue = node._origVi;
        }
      }

      // 5. Input placeholders & Textareas
      document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(input => {
        if (typeof input._origPlaceholder !== "string") {
          input._origPlaceholder = input.getAttribute("placeholder") || "";
        }
        const orig = input._origPlaceholder;
        const trimmed = orig.trim();
        const normalized = trimmed.replace(/\s+/g, " ");
        if (isEn) {
          if (this.pageDict[trimmed]) input.setAttribute("placeholder", this.pageDict[trimmed]);
          else if (this.pageDict[normalized]) input.setAttribute("placeholder", this.pageDict[normalized]);
          else {
            let p = orig;
            for (let i = 0; i < sortedDict.length; i++) {
              const viKey = sortedDict[i][0];
              const enVal = sortedDict[i][1];
              if (viKey.length >= 4 && p.includes(viKey)) {
                p = p.split(viKey).join(enVal);
              }
            }
            input.setAttribute("placeholder", p);
          }
        } else {
          input.setAttribute("placeholder", orig);
        }
      });

      // 6. Tooltips (title attribute)
      document.querySelectorAll("[title]").forEach(el => {
        if (el.closest("#headerLangToggle") || el.closest(".toggleWrapper")) return;
        if (typeof el._origTitle !== "string") {
          el._origTitle = el.getAttribute("title") || "";
        }
        const orig = el._origTitle;
        const trimmed = orig.trim();
        const normalized = trimmed.replace(/\s+/g, " ");
        if (isEn) {
          if (this.pageDict[trimmed]) el.setAttribute("title", this.pageDict[trimmed]);
          else if (this.pageDict[normalized]) el.setAttribute("title", this.pageDict[normalized]);
          else {
            let t = orig;
            for (let i = 0; i < sortedDict.length; i++) {
              const viKey = sortedDict[i][0];
              const enVal = sortedDict[i][1];
              if (viKey.length >= 4 && t.includes(viKey)) {
                t = t.split(viKey).join(enVal);
              }
            }
            el.setAttribute("title", t);
          }
        } else {
          el.setAttribute("title", orig);
        }
      });

      // 7. Accessibility Labels (aria-label attribute)
      document.querySelectorAll("[aria-label]").forEach(el => {
        if (el.closest("#headerLangToggle") || el.closest(".toggleWrapper") || el.classList.contains("nav-toggle")) return;
        if (typeof el._origAriaLabel !== "string") {
          el._origAriaLabel = el.getAttribute("aria-label") || "";
        }
        const orig = el._origAriaLabel;
        const trimmed = orig.trim();
        const normalized = trimmed.replace(/\s+/g, " ");
        if (isEn) {
          if (this.pageDict[trimmed]) el.setAttribute("aria-label", this.pageDict[trimmed]);
          else if (this.pageDict[normalized]) el.setAttribute("aria-label", this.pageDict[normalized]);
          else {
            let a = orig;
            for (let i = 0; i < sortedDict.length; i++) {
              const viKey = sortedDict[i][0];
              const enVal = sortedDict[i][1];
              if (viKey.length >= 4 && a.includes(viKey)) {
                a = a.split(viKey).join(enVal);
              }
            }
            el.setAttribute("aria-label", a);
          }
        } else {
          el.setAttribute("aria-label", orig);
        }
      });
    },
    applyTranslations() {
      const lang = this.getLang();
      this.currentLang = lang;

      // 1. Cập nhật nút VI / EN
      document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
      });

      // 2. Phụ đề thương hiệu Header
      const brandSmall = document.querySelector(".brand-name small");
      if (brandSmall) {
        brandSmall.textContent = this.t("brandSub");
      }

      // 3. Tiêu đề và chân trang trong Drawer
      const menuTitle = document.getElementById("siteNavTitle");
      if (menuTitle) menuTitle.textContent = this.t("menuTitle");
      const menuSubtitle = document.getElementById("siteNavFooterText");
      if (menuSubtitle) menuSubtitle.textContent = this.t("menuSubtitle");

      // 4. Cập nhật 7 liên kết điều hướng
      document.querySelectorAll(".site-nav-link").forEach(link => {
        const key = link.getAttribute("data-nav-key");
        if (key) {
          const titleEl = link.querySelector(".nav-item-title");
          const descEl = link.querySelector(".nav-item-desc");
          if (titleEl) titleEl.textContent = this.t("nav_" + key);
          if (descEl) descEl.textContent = this.t("nav_" + key + "_desc");
        }
      });

      // 5. Nút đóng mở menu
      const toggle = document.querySelector(".nav-toggle");
      if (toggle) {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-label", isOpen ? this.t("menuClose") : this.t("menuOpen"));
      }

      // 6. Tooltip Theme Switcher
      const themeWrapper = document.getElementById("themeToggleWrapper");
      if (themeWrapper) {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        themeWrapper.title = isDark ? this.t("themeLight") : this.t("themeDark");
      }

      // 7. Tooltip Back to Top
      const backToTop = document.getElementById("btnBackToTop");
      if (backToTop) {
        backToTop.title = this.t("backToTop");
        backToTop.setAttribute("aria-label", this.t("backToTop"));
      }

      // 8. Tooltips User Badge
      const userPill = document.getElementById("btnNavUserPill");
      if (userPill) {
        userPill.title = this.t("profileSettings");
      }
      const logoutBtn = document.getElementById("btnNavLogout");
      if (logoutBtn) {
        logoutBtn.title = this.t("logout");
      }
      const authLink = document.querySelector(".nav-auth-link");
      if (authLink) {
        authLink.textContent = this.t("login");
        authLink.title = this.t("login");
      }

      // 9. Dịch toàn bộ nội dung hiển thị của trang
      this.translatePageContent(lang);

      // 10. Các thẻ data-i18n tùy chọn
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const k = el.getAttribute("data-i18n");
        const val = this.t(k);
        if (val) el.textContent = val;
      });
    }
  };
  window.AICheckI18n = AICheckI18n;

  // 2. KHỞI TẠO NÚT CHUYỂN NGÔN NGỮ VI / EN TRÊN HEADER
  function initLanguageSwitcher() {
    const headerRight = getHeaderRight();
    if (!headerRight || document.getElementById("headerLangToggle")) return;

    const currentLang = AICheckI18n.getLang();

    const wrap = document.createElement("div");
    wrap.className = "lang-toggle";
    wrap.id = "headerLangToggle";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Ngôn ngữ / Language");
    wrap.innerHTML = `
      <button type="button" class="lang-btn ${currentLang === 'vi' ? 'is-active' : ''}" data-lang="vi" title="Tiếng Việt">VI</button>
      <span class="lang-sep">/</span>
      <button type="button" class="lang-btn ${currentLang === 'en' ? 'is-active' : ''}" data-lang="en" title="English">EN</button>
    `;

    const navToggle = headerRight.querySelector(".nav-toggle");
    if (navToggle) {
      headerRight.insertBefore(wrap, navToggle);
    } else {
      headerRight.appendChild(wrap);
    }

    wrap.querySelectorAll(".lang-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetLang = btn.getAttribute("data-lang");
        if (targetLang && targetLang !== AICheckI18n.getLang()) {
          window.AICheckAudio?.playClick();
          AICheckI18n.setLang(targetLang);
        }
      });
    });
  }

  // 3. ĐỊNH NGHĨA VÀ TRANG TRÍ 7 MỤC ĐIỀU HƯỚNG TRONG MENU ☰
  const NAV_DEFINITIONS = {
    home: {
      icon: "🏠",
      vi: { title: "Trang chủ", desc: "Tổng quan & Bản đồ tư duy kiểm chứng" },
      en: { title: "Home", desc: "Overview & Fact-check Mindmap" }
    },
    knowledge: {
      icon: "📖",
      vi: { title: "Kiến thức", desc: "4 Chuyên đề cốt lõi & Nhận diện lỗi AI" },
      en: { title: "Knowledge", desc: "4 Core Modules & AI Hallucination" }
    },
    practice: {
      icon: "⚡",
      vi: { title: "Thực hành", desc: "Huấn luyện tương tác & Bóc mẽ Deepfake" },
      en: { title: "Practice", desc: "Interactive Training & Deepfake" }
    },
    assessment: {
      icon: "📐",
      vi: { title: "Đánh giá", desc: "4 Bộ đề chuẩn hóa & Cấp chứng chỉ" },
      en: { title: "Assessment", desc: "Standardized Tests & Certificate" }
    },
    leaderboard: {
      icon: "🏆",
      vi: { title: "BXH", desc: "Bảng vinh danh & Thăng hạng XP toàn trường" },
      en: { title: "Leaderboard", desc: "Hall of Fame & Schoolwide Ranking" }
    },
    research: {
      icon: "📊",
      vi: { title: "Nghiên cứu", desc: "Báo cáo KHKT & Khảo sát THPT Trần Hưng Đạo" },
      en: { title: "Research", desc: "Scientific Report & THD Survey" }
    },
    resources: {
      icon: "📁",
      vi: { title: "Tài nguyên", desc: "Cẩm nang học tập, Infographic & AI Tools" },
      en: { title: "Resources", desc: "Handbook, Infographic & AI Tools" }
    }
  };

  function getNavKey(link) {
    const href = (link.getAttribute("href") || "").toLowerCase();
    const text = (link.textContent || "").trim().toLowerCase();
    if (href.includes("index.html") || text.includes("trang chủ") || text === "home") return "home";
    if (href.includes("knowledge.html") || text.includes("kiến thức") || text === "knowledge") return "knowledge";
    if (href.includes("practice.html") || text.includes("thực hành") || text === "practice") return "practice";
    if (href.includes("assessment.html") || text.includes("đánh giá") || text === "assessment") return "assessment";
    if (href.includes("leaderboard.html") || text.includes("bxh") || text === "leaderboard") return "leaderboard";
    if (href.includes("research.html") || text.includes("nghiên cứu") || text === "research") return "research";
    if (href.includes("resources.html") || text.includes("tài nguyên") || text === "resources") return "resources";
    return null;
  }

  function decorateNavLinks(nav) {
    if (!nav || nav.dataset.decorated === "true") return;
    nav.dataset.decorated = "true";

    // Tạo Header cho Drawer
    if (!nav.querySelector(".site-nav-header")) {
      const header = document.createElement("div");
      header.className = "site-nav-header";
      header.innerHTML = `
        <div class="site-nav-header-left">
          <span class="site-nav-badge">AI CHECK THĐ</span>
          <h3 class="site-nav-title" id="siteNavTitle">${AICheckI18n.t("menuTitle")}</h3>
        </div>
        <button type="button" class="site-nav-close" id="btnSiteNavClose" aria-label="Đóng menu">✕</button>
      `;
      nav.prepend(header);
    }

    // Format 7 items
    const lang = AICheckI18n.getLang();
    nav.querySelectorAll("a").forEach(link => {
      if (link.classList.contains("nav-auth-link")) return;
      const key = getNavKey(link);
      if (!key) return;
      const item = NAV_DEFINITIONS[key];
      if (!item) return;

      link.className = "site-nav-link";
      link.setAttribute("data-nav-key", key);
      link.innerHTML = `
        <span class="nav-icon-badge">${item.icon}</span>
        <span class="nav-item-content">
          <strong class="nav-item-title">${item[lang].title}</strong>
          <small class="nav-item-desc">${item[lang].desc}</small>
        </span>
        <span class="nav-item-arrow" aria-hidden="true">→</span>
      `;
    });

    // Tạo Footer cho Drawer
    if (!nav.querySelector(".site-nav-footer")) {
      const footer = document.createElement("div");
      footer.className = "site-nav-footer";
      footer.innerHTML = `<small id="siteNavFooterText">${AICheckI18n.t("menuSubtitle")}</small>`;
      nav.appendChild(footer);
    }
  }

  // 4. HAMBURGER MENU VÀ FLOATING DRAWER CONTROLLER
  function initHamburgerNav() {
    const headerInner = document.querySelector(".header-inner");
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("siteNav") || (toggle && document.getElementById(toggle.getAttribute("aria-controls")));
    if (!headerInner || !toggle || !nav) return;

    const headerRight = getHeaderRight();
    if (headerRight && toggle.parentElement !== headerRight) {
      headerRight.appendChild(toggle);
    }

    // Tạo Backdrop
    let backdrop = document.getElementById("siteNavBackdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "siteNavBackdrop";
      backdrop.className = "site-nav-backdrop";
      document.body.appendChild(backdrop);
    }

    decorateNavLinks(nav);

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      backdrop.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? AICheckI18n.t("menuClose") : AICheckI18n.t("menuOpen"));
      const span = toggle.querySelector("span");
      if (span) span.textContent = open ? "✕" : "☰";
      if (open) {
        window.AICheckAudio?.playClick();
      }
    }

    // Toggle click
    toggle.onclick = (e) => {
      e.stopPropagation();
      const currentlyOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!currentlyOpen);
    };

    // Nút đóng bên trong Drawer
    const closeBtn = nav.querySelector("#btnSiteNavClose");
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        setOpen(false);
      };
    }

    // Backdrop click
    backdrop.onclick = () => setOpen(false);

    // Click link trong menu sẽ tự đóng menu
    nav.onclick = (e) => {
      if (e.target.closest("a")) {
        setOpen(false);
      }
    };

    // Phím Escape đóng menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
      }
    });

    // Click ngoài
    document.addEventListener("click", (e) => {
      if (toggle.getAttribute("aria-expanded") === "true") {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
          setOpen(false);
        }
      }
    });
  }

  // 5. THEME SWITCHER DARK / LIGHT MODE (TÍCH HỢP TOOLBAR HEADER)
  function initThemeSwitcher() {
    const headerInner = document.querySelector(".header-inner");
    if (!headerInner || document.getElementById("dn") || document.getElementById("themeToggleWrapper")) return;
    const headerRight = getHeaderRight();
    if (!headerRight) return;

    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const isDark = currentTheme === "dark";

    const wrapper = document.createElement("div");
    wrapper.className = "toggleWrapper";
    wrapper.id = "themeToggleWrapper";
    wrapper.title = isDark ? AICheckI18n.t("themeLight") : AICheckI18n.t("themeDark");
    wrapper.innerHTML = `
      <!-- From Uiverse.io by mobinkakei --> 
      <input class="input" id="dn" type="checkbox" ${isDark ? "checked" : ""} aria-label="Chuyển giao diện Sáng / Tối" />
      <label class="toggle" for="dn">
        <span class="toggle__handler">
          <span class="crater crater--1"></span>
          <span class="crater crater--2"></span>
          <span class="crater crater--3"></span>
        </span>
        <span class="star star--1"></span>
        <span class="star star--2"></span>
        <span class="star star--3"></span>
        <span class="star star--4"></span>
        <span class="star star--5"></span>
        <span class="star star--6"></span>
      </label>
    `;

    const navToggle = headerRight.querySelector(".nav-toggle");
    if (navToggle) {
      headerRight.insertBefore(wrapper, navToggle);
    } else {
      headerRight.appendChild(wrapper);
    }

    const input = wrapper.querySelector("#dn");
    input.addEventListener("change", () => {
      window.AICheckAudio?.playClick();
      const active = input.checked ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", active);
      localStorage.setItem("aicheck:theme", active);
      wrapper.title = active === "dark" ? AICheckI18n.t("themeLight") : AICheckI18n.t("themeDark");
    });

    // Đồng bộ nếu thuộc tính data-theme thay đổi
    const observer = new MutationObserver(() => {
      const active = document.documentElement.getAttribute("data-theme") === "dark";
      if (input.checked !== active) {
        input.checked = active;
        wrapper.title = active ? AICheckI18n.t("themeLight") : AICheckI18n.t("themeDark");
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  // ==========================================================================
  // E. HỆ THỐNG TOAST & MODAL TÙY CHỈNH HỒ SƠ CÁ NHÂN (USER PROFILE SETTINGS)
  // ==========================================================================
  const PRESET_EMOJIS = ["🎓", "🧑‍🎓", "🚀", "🔬", "⚡", "🌟", "🦊", "🦁", "🦉", "🐬", "🎯", "💡", "🛡️", "📚"];
  let profileCurrentAvatar = "🎓";
  let profileActiveTab = "info";

  function showProfileToast(message, type = "success") {
    let container = document.getElementById("profileToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "profileToastContainer";
      container.className = "profile-toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `profile-toast ${type === "error" ? "toast-error" : "toast-success"}`;
    const icon = type === "error" ? "⚠️" : "✓";
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    if (type === "success") {
      window.AICheckAudio?.playCorrect();
    } else {
      window.AICheckAudio?.playWrong();
    }

    setTimeout(() => {
      toast.classList.add("is-hiding");
      setTimeout(() => toast.remove(), 260);
    }, 3600);
  }

  function renderAvatarToElement(containerEl, avatarVal) {
    if (!containerEl) return;
    const val = String(avatarVal || "🎓").trim();
    if (val.startsWith("http") || val.startsWith("data:image")) {
      containerEl.innerHTML = `<img src="${escapeHtml(val)}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    } else {
      containerEl.textContent = val;
    }
  }

  function processAvatarFile(file, callback) {
    if (!file || !file.type.startsWith("image/")) {
      showProfileToast("Vui lòng chọn file hình ảnh (PNG, JPG, WEBP)", "error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showProfileToast("Kích thước ảnh tối đa là 8MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 180;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        callback(dataUrl);
      };
      img.onerror = () => showProfileToast("Không thể giải mã file ảnh này", "error");
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function initUserProfileModal() {
    if (document.getElementById("profileModalBackdrop")) return;

    const modalMarkup = `
      <div class="profile-modal-backdrop" id="profileModalBackdrop" role="dialog" aria-modal="true" aria-labelledby="profileModalTitle">
        <div class="profile-modal-card">
          <!-- Header -->
          <div class="profile-modal-header">
            <div class="profile-modal-title-box">
              <h3 id="profileModalTitle">Hồ Sơ Cá Nhân</h3>
              <small>Tùy chỉnh thông tin học tập & bảo mật tài khoản</small>
            </div>
            <button type="button" class="profile-modal-close" id="btnCloseProfileModal" aria-label="Đóng cửa sổ">✕</button>
          </div>

          <!-- Tabs -->
          <div class="profile-tabs">
            <button type="button" class="profile-tab-btn is-active" data-profile-tab="info" id="tabBtnInfo">
              <span>👤</span> Thông tin chung
            </button>
            <button type="button" class="profile-tab-btn" data-profile-tab="security" id="tabBtnSecurity">
              <span>🔐</span> Đổi mật khẩu
            </button>
          </div>

          <!-- Body -->
          <div class="profile-form-body">
            <!-- TAB 1: THÔNG TIN CHUNG -->
            <div class="profile-tab-pane is-active" id="profileTabInfo">
              <div class="profile-avatar-section">
                <div class="profile-avatar-preview" id="profileAvatarPreview">🎓</div>
                <div class="profile-avatar-picker">
                  <div class="profile-avatar-picker-label">
                    <span>Chọn ảnh đại diện:</span>
                    <span class="profile-hint">Emoji hoặc tải ảnh riêng</span>
                  </div>
                  <div class="profile-emoji-grid" id="profileEmojiGrid"></div>
                  <div style="display:flex;gap:12px;margin-top:8px;align-items:center;flex-wrap:wrap">
                    <button type="button" class="profile-avatar-custom-link" id="btnTriggerUploadAvatar" style="background:none;border:none;padding:0">📁 Tải ảnh từ máy</button>
                    <button type="button" class="profile-avatar-custom-link" id="btnToggleUrlAvatar" style="background:none;border:none;padding:0">🔗 Dán link ảnh</button>
                    <input type="file" id="profileAvatarFileInput" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none">
                  </div>
                  <div id="profileAvatarUrlRow" style="display:none;margin-top:8px">
                    <div style="display:flex;gap:6px">
                      <input type="url" id="profileInputAvatarUrl" class="profile-input" placeholder="https://example.com/avatar.jpg" style="font-size:11px;padding:6px 10px">
                      <button type="button" class="button button-lime" id="btnApplyAvatarUrl" style="padding:6px 12px;font-size:10.5px">Áp dụng</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="profile-form-grid">
                <div class="profile-form-group">
                  <label class="profile-label" for="profileInputName">
                    <span>Họ và tên / Biệt danh</span>
                    <span style="color:#e97850">*</span>
                  </label>
                  <input type="text" id="profileInputName" class="profile-input" maxlength="32" placeholder="Ví dụ: Nguyễn Văn An" autocomplete="name">
                </div>

                <div class="profile-form-group">
                  <label class="profile-label" for="profileInputEmail">
                    <span>Email / Tài khoản</span>
                    <small style="opacity:0.6;font-weight:normal">(Chỉ đọc)</small>
                  </label>
                  <input type="text" id="profileInputEmail" class="profile-input" readonly placeholder="Khách vãng lai">
                </div>

                <div class="profile-form-group">
                  <label class="profile-label" for="profileInputClass">
                    <span>Lớp học</span>
                  </label>
                  <input type="text" id="profileInputClass" class="profile-input" maxlength="20" placeholder="Ví dụ: 12A5">
                </div>

                <div class="profile-form-group">
                  <label class="profile-label" for="profileInputSchool">
                    <span>Trường học</span>
                  </label>
                  <input type="text" id="profileInputSchool" class="profile-input" maxlength="60" placeholder="THPT Trần Hưng Đạo">
                </div>

                <div class="profile-form-group full-width">
                  <label class="profile-label" for="profileInputBirthdate">
                    <span>Ngày sinh</span>
                  </label>
                  <input type="date" id="profileInputBirthdate" class="profile-input">
                </div>

                <div class="profile-form-group full-width">
                  <label class="profile-label" for="profileInputBio">
                    <span>Câu nói yêu thích / Châm ngôn (Motto)</span>
                  </label>
                  <textarea id="profileInputBio" class="profile-textarea" rows="2" maxlength="160" placeholder="Ví dụ: Kiểm chứng thông tin trước khi tin - Tư duy phản biện thời đại AI."></textarea>
                  <span class="profile-hint">Tối đa 160 ký tự. Sẽ lưu cùng hồ sơ học tập của em.</span>
                </div>
              </div>
            </div>

            <!-- TAB 2: ĐỔI MẬT KHẨU -->
            <div class="profile-tab-pane" id="profileTabSecurity">
              <div id="profileSecurityGuestNotice" style="display:none;margin-bottom:14px;padding:12px;background:rgba(233,120,80,0.1);border-left:3px solid #e97850;border-radius:6px;font-size:11px;line-height:1.5">
                ℹ️ Bạn đang dùng chế độ <strong>Khách vãng lai</strong>. Hãy đăng nhập tài khoản Supabase Cloud để sử dụng tính năng Đổi mật khẩu.
              </div>
              <div id="profileSecurityFormFields">
                <div class="profile-form-group">
                  <label class="profile-label" for="profileInputNewPassword">
                    <span>Mật khẩu mới</span>
                    <span style="color:#e97850">*</span>
                  </label>
                  <input type="password" id="profileInputNewPassword" class="profile-input" placeholder="Tối thiểu 6 ký tự" minlength="6" autocomplete="new-password">
                </div>

                <div class="profile-form-group">
                  <label class="profile-label" for="profileInputConfirmPassword">
                    <span>Xác nhận mật khẩu mới</span>
                    <span style="color:#e97850">*</span>
                  </label>
                  <input type="password" id="profileInputConfirmPassword" class="profile-input" placeholder="Nhập lại mật khẩu mới" autocomplete="new-password">
                </div>

                <div class="profile-hint" style="margin-top:10px;line-height:1.6">
                  🔒 <strong>Bảo mật tài khoản:</strong> Mật khẩu mới cần tối thiểu 6 ký tự. Hãy ghi nhớ để đăng nhập trong các phiên làm việc tiếp theo.
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="profile-modal-footer">
            <button type="button" class="button button-outline" id="btnCancelProfileModal">Hủy bỏ</button>
            <button type="button" class="button button-lime btn-save-profile" id="btnSaveProfileModal">
              <span>💾 Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalMarkup);

    // Render Emoji buttons
    const emojiGrid = document.getElementById("profileEmojiGrid");
    if (emojiGrid) {
      emojiGrid.innerHTML = PRESET_EMOJIS.map(emoji => `
        <button type="button" class="profile-emoji-btn" data-emoji="${emoji}" title="Chọn ${emoji}">${emoji}</button>
      `).join("");

      emojiGrid.addEventListener("click", (e) => {
        const btn = e.target.closest(".profile-emoji-btn");
        if (!btn) return;
        const emoji = btn.getAttribute("data-emoji");
        profileCurrentAvatar = emoji;
        updateEmojiSelection();
        renderAvatarToElement(document.getElementById("profileAvatarPreview"), emoji);
        window.AICheckAudio?.playClick();
      });
    }

    function updateEmojiSelection() {
      const btns = emojiGrid?.querySelectorAll(".profile-emoji-btn") || [];
      btns.forEach(b => {
        b.classList.toggle("is-selected", b.getAttribute("data-emoji") === profileCurrentAvatar);
      });
    }

    // Trigger File Upload
    const fileInput = document.getElementById("profileAvatarFileInput");
    document.getElementById("btnTriggerUploadAvatar")?.addEventListener("click", () => {
      fileInput?.click();
    });

    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processAvatarFile(file, (dataUrl) => {
        profileCurrentAvatar = dataUrl;
        updateEmojiSelection();
        renderAvatarToElement(document.getElementById("profileAvatarPreview"), dataUrl);
        showProfileToast("Đã tải ảnh đại diện thành công!", "success");
      });
    });

    // Toggle URL row
    const urlRow = document.getElementById("profileAvatarUrlRow");
    document.getElementById("btnToggleUrlAvatar")?.addEventListener("click", () => {
      if (urlRow) {
        urlRow.style.display = urlRow.style.display === "none" ? "block" : "none";
        if (urlRow.style.display === "block") {
          document.getElementById("profileInputAvatarUrl")?.focus();
        }
      }
    });

    function applyUrlAvatar() {
      const urlInput = document.getElementById("profileInputAvatarUrl");
      const url = String(urlInput?.value || "").trim();
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) {
        showProfileToast("Vui lòng nhập đường link hợp lệ (bắt đầu bằng http:// hoặc https://)", "error");
        return;
      }
      profileCurrentAvatar = url;
      updateEmojiSelection();
      renderAvatarToElement(document.getElementById("profileAvatarPreview"), url);
      showProfileToast("Đã áp dụng ảnh đại diện từ đường link!", "success");
    }

    document.getElementById("btnApplyAvatarUrl")?.addEventListener("click", applyUrlAvatar);
    document.getElementById("profileInputAvatarUrl")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyUrlAvatar();
      }
    });

    // Tab Switching
    const tabBtns = document.querySelectorAll(".profile-tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        window.AICheckAudio?.playClick();
        const tab = btn.getAttribute("data-profile-tab");
        setProfileTab(tab);
      });
    });

    function setProfileTab(tab) {
      profileActiveTab = tab;
      tabBtns.forEach(b => b.classList.toggle("is-active", b.getAttribute("data-profile-tab") === tab));
      document.getElementById("profileTabInfo")?.classList.toggle("is-active", tab === "info");
      document.getElementById("profileTabSecurity")?.classList.toggle("is-active", tab === "security");

      const saveBtn = document.getElementById("btnSaveProfileModal");
      if (saveBtn) {
        saveBtn.innerHTML = tab === "info" ? `<span>💾 Lưu thông tin</span>` : `<span>🔐 Cập nhật mật khẩu</span>`;
      }
    }

    // Modal Close Triggers
    const backdrop = document.getElementById("profileModalBackdrop");
    function closeModal() {
      backdrop?.classList.remove("is-open");
    }

    document.getElementById("btnCloseProfileModal")?.addEventListener("click", closeModal);
    document.getElementById("btnCancelProfileModal")?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop?.classList.contains("is-open")) {
        closeModal();
      }
    });

    // Save Action
    const btnSave = document.getElementById("btnSaveProfileModal");
    btnSave?.addEventListener("click", async () => {
      if (profileActiveTab === "info") {
        const nameInput = document.getElementById("profileInputName");
        const classInput = document.getElementById("profileInputClass");
        const schoolInput = document.getElementById("profileInputSchool");
        const birthInput = document.getElementById("profileInputBirthdate");
        const bioInput = document.getElementById("profileInputBio");

        const displayName = String(nameInput?.value || "").trim();
        if (!displayName) {
          showProfileToast("Vui lòng nhập Họ và tên hoặc Biệt danh!", "error");
          nameInput?.focus();
          return;
        }

        btnSave.classList.add("is-loading");
        try {
          const fields = {
            display_name: displayName,
            avatar: profileCurrentAvatar,
            class_name: String(classInput?.value || "").trim(),
            school: String(schoolInput?.value || "THPT Trần Hưng Đạo").trim(),
            birthdate: birthInput?.value || "",
            bio: String(bioInput?.value || "").trim()
          };

          const res = await window.AICheckCloud.updateProfile(fields);
          btnSave.classList.remove("is-loading");

          if (res?.error) {
            showProfileToast("Lỗi cập nhật: " + (res.error.message || "Vui lòng thử lại"), "error");
          } else {
            showProfileToast("Cập nhật hồ sơ cá nhân thành công!", "success");
            window.dispatchEvent(new CustomEvent("aicheck:profile-updated", { detail: res.data || fields }));
            setTimeout(closeModal, 400);
          }
        } catch (err) {
          btnSave.classList.remove("is-loading");
          showProfileToast("Đã xảy ra lỗi khi lưu thông tin", "error");
        }
      } else {
        // Tab Security: Change password
        let user = null;
        if (window.AICheckCloud?.getUser) {
          try { user = await window.AICheckCloud.getUser(); } catch {}
        }
        if (!user) {
          showProfileToast("Vui lòng đăng nhập tài khoản để đổi mật khẩu!", "error");
          return;
        }

        const newPassInput = document.getElementById("profileInputNewPassword");
        const confirmPassInput = document.getElementById("profileInputConfirmPassword");
        const newPass = String(newPassInput?.value || "");
        const confirmPass = String(confirmPassInput?.value || "");

        if (!newPass || newPass.length < 6) {
          showProfileToast("Mật khẩu mới phải có tối thiểu 6 ký tự!", "error");
          newPassInput?.focus();
          return;
        }
        if (newPass !== confirmPass) {
          showProfileToast("Mật khẩu xác nhận không khớp!", "error");
          confirmPassInput?.focus();
          return;
        }

        btnSave.classList.add("is-loading");
        try {
          const res = await window.AICheckCloud.updatePassword(newPass);
          btnSave.classList.remove("is-loading");
          if (res?.error) {
            showProfileToast("Lỗi đổi mật khẩu: " + (res.error.message || "Thất bại"), "error");
          } else {
            showProfileToast("Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới nhé.", "success");
            newPassInput.value = "";
            confirmPassInput.value = "";
            setTimeout(closeModal, 500);
          }
        } catch (err) {
          btnSave.classList.remove("is-loading");
          showProfileToast("Đã xảy ra lỗi khi cập nhật mật khẩu", "error");
        }
      }
    });

    // Xuất hàm mở modal ra window
    window.openUserProfileModal = async function() {
      const backdrop = document.getElementById("profileModalBackdrop");
      if (!backdrop) return;

      setProfileTab("info");
      document.getElementById("profileInputNewPassword").value = "";
      document.getElementById("profileInputConfirmPassword").value = "";
      document.getElementById("profileAvatarUrlRow").style.display = "none";

      let prof = {};
      if (window.AICheckCloud?.getProfile) {
        try {
          const res = await window.AICheckCloud.getProfile();
          prof = res?.data || {};
        } catch {}
      } else {
        try { prof = JSON.parse(localStorage.getItem("aicheck:user_profile") || "{}"); } catch {}
      }

      let user = null;
      if (window.AICheckCloud?.getUser) {
        try { user = await window.AICheckCloud.getUser(); } catch {}
      }

      let localPlayer = "";
      try { localPlayer = JSON.parse(localStorage.getItem("aicheck:player") || '""'); } catch {}

      const nameVal = prof.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || localPlayer || "";
      const emailVal = user?.email || (localPlayer ? "Chế độ Khách (Offline)" : "Chưa đăng nhập");
      const classVal = prof.class_name || "";
      const schoolVal = prof.school || "THPT Trần Hưng Đạo";
      const birthVal = prof.birthdate || "";
      const bioVal = prof.bio || "";
      profileCurrentAvatar = prof.avatar || user?.user_metadata?.avatar || localStorage.getItem("aicheck:avatar") || "🎓";

      document.getElementById("profileInputName").value = nameVal;
      document.getElementById("profileInputEmail").value = emailVal;
      document.getElementById("profileInputClass").value = classVal;
      document.getElementById("profileInputSchool").value = schoolVal;
      document.getElementById("profileInputBirthdate").value = birthVal;
      document.getElementById("profileInputBio").value = bioVal;

      renderAvatarToElement(document.getElementById("profileAvatarPreview"), profileCurrentAvatar);
      updateEmojiSelection();

      // Hiển thị chú thích khách nếu chưa đăng nhập
      const guestNotice = document.getElementById("profileSecurityGuestNotice");
      const secFields = document.getElementById("profileSecurityFormFields");
      if (guestNotice && secFields) {
        if (!user) {
          guestNotice.style.display = "block";
          secFields.style.opacity = "0.45";
          secFields.style.pointerEvents = "none";
        } else {
          guestNotice.style.display = "none";
          secFields.style.opacity = "1";
          secFields.style.pointerEvents = "auto";
        }
      }

      backdrop.classList.add("is-open");
    };

    window.closeUserProfileModal = closeModal;
  }

  // ==========================================================================
  // F. GẮN HUY HIỆU TÀI KHOẢN, XP & STREAK VÀO HEADER (TÍCH HỢP PROFILE MODAL)
  // ==========================================================================
  async function attachAuthBadge() {
    if (document.getElementById("navAuthContainer")) return;
    const headerRight = getHeaderRight();
    if (!headerRight) return;
    const isPagesDir = location.pathname.includes("/pages/");
    const loginHref = isPagesDir ? "../login.html" : "login.html";
    const adminHref = isPagesDir ? "../admin.html" : "admin.html";

    const container = document.createElement("span");
    container.id = "navAuthContainer";
    container.className = "nav-auth-item";

    async function renderBadgeContent() {
      let user = null;
      if (window.AICheckCloud?.getUser) {
        try { user = await window.AICheckCloud.getUser(); } catch {}
      }

      // Nếu có user: kiểm tra và khôi phục chuỗi ngày đăng nhập
      if (user) {
        if (user.user_metadata?.gamification && AICheckGamification.restoreFromCloud) {
          AICheckGamification.restoreFromCloud(user.user_metadata.gamification);
        }
        if (AICheckGamification.checkDailyLoginStreak) {
          AICheckGamification.checkDailyLoginStreak(user);
        }
      }

      const stats = AICheckGamification.getStats();
      const isEn = (window.AICheckI18n && window.AICheckI18n.getLang ? window.AICheckI18n.getLang() === "en" : false);

      const streakHtml = user
        ? (stats.streak > 0 
            ? `<span style="opacity:0.4">|</span><span class="flame-icon" title="${isEn ? `Daily login streak: ${stats.streak} day(s) · Record: ${stats.bestStreak} days` : `Chuỗi đăng nhập: ${stats.streak} ngày liên tiếp · Kỷ lục: ${stats.bestStreak} ngày`}">🔥 ${stats.streak} ${isEn ? (stats.streak > 1 ? "Days" : "Day") : "Ngày"}</span>` 
            : `<span style="opacity:0.4">|</span><span class="flame-icon" title="${isEn ? "Streak active today" : "Đã ghi nhận chuỗi hôm nay"}">🔥 1 ${isEn ? "Day" : "Ngày"}</span>`)
        : `<span style="opacity:0.4">|</span><span class="flame-icon" style="opacity:0.5" title="${isEn ? "Log in to activate daily streak!" : "Đăng nhập tài khoản để tích lũy chuỗi ngày!"}">🔥 0 ${isEn ? "Days" : "Ngày"}</span>`;

      const gamifyPill = `
        <span class="nav-gamify-pill" title="Cấp ${stats.level}: ${stats.levelTitle} · ${stats.xp} XP">
          <span>${stats.levelIcon} Lv.${stats.level}</span>
          <span style="opacity:0.4">|</span>
          <span>⭐ ${stats.xp} XP</span>
          ${streakHtml}
        </span>
      `;

      let localProf = {};
      try { localProf = JSON.parse(localStorage.getItem("aicheck:user_profile") || "{}"); } catch {}
      const savedAvatar = localProf.avatar || user?.user_metadata?.avatar || localStorage.getItem("aicheck:avatar") || "🎓";
      const isImgAvatar = savedAvatar.startsWith("http") || savedAvatar.startsWith("data:image");
      const avatarHtml = isImgAvatar
        ? `<span class="nav-user-avatar"><img src="${escapeHtml(savedAvatar)}" alt="Avatar"></span>`
        : `<span class="nav-user-avatar">${escapeHtml(savedAvatar)}</span>`;

      if (user) {
        const name = localProf.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || AICheckI18n.t("member");
        const isAdmin = window.AICheckCloud?.isAdmin ? window.AICheckCloud.isAdmin(user) : false;
        container.innerHTML = `
          ${gamifyPill}
          <span class="nav-user-pill" id="btnNavUserPill" title="${AICheckI18n.t('profileSettings')}">
            ${avatarHtml}
            <span id="navUserNameText">${escapeHtml(name.slice(0, 14))}</span>
            <span class="nav-user-edit-icon" title="${AICheckI18n.t('settings')}">⚙️</span>
            ${isAdmin ? `<a href="${adminHref}" style="color:var(--leaf);text-decoration:none;font-weight:800;margin-left:4px" title="${AICheckI18n.t('adminPanel')}">[Admin]</a>` : ""}
            <span class="nav-user-logout" title="${AICheckI18n.t('logout')}" id="btnNavLogout">✕</span>
          </span>
        `;
        document.getElementById("btnNavUserPill")?.addEventListener("click", (e) => {
          if (e.target.closest("#btnNavLogout")) return;
          if (e.target.closest("a")) return;
          window.openUserProfileModal?.();
        });
        document.getElementById("btnNavLogout")?.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (confirm(AICheckI18n.t("logoutConfirm"))) {
            await window.AICheckCloud.signOut();
          }
        });
      } else {
        let localName = "";
        try { localName = JSON.parse(localStorage.getItem("aicheck:player") || '""'); } catch {}
        if (!localName && localProf.display_name) localName = localProf.display_name;

        if (localName) {
          container.innerHTML = `
            ${gamifyPill}
            <span class="nav-user-pill" id="btnNavUserPill" title="${AICheckI18n.t('profileSettingsGuest')}">
              ${avatarHtml}
              <span id="navUserNameText">${escapeHtml(localName.slice(0, 12))}</span>
              <span class="nav-user-edit-icon">⚙️</span>
              <a href="${loginHref}" class="nav-auth-link" style="margin-left:6px;font-size:10px" title="${AICheckI18n.t('login')}">${AICheckI18n.t('login')}</a>
            </span>
          `;
          document.getElementById("btnNavUserPill")?.addEventListener("click", (e) => {
            if (e.target.closest("a")) return;
            window.openUserProfileModal?.();
          });
        } else {
          container.innerHTML = `
            ${gamifyPill}
            <a href="${loginHref}" class="nav-auth-link" title="${AICheckI18n.t('login')}">${AICheckI18n.t('login')}</a>
          `;
        }
      }
    }

    renderBadgeContent();
    const navToggle = headerRight.querySelector(".nav-toggle");
    if (navToggle) {
      headerRight.insertBefore(container, navToggle);
    } else {
      headerRight.appendChild(container);
    }

    // Lắng nghe cập nhật XP & Streak, Cập nhật hồ sơ và Ngôn ngữ để đồng bộ tức thì trên Header
    window.addEventListener("aicheck:gamify-change", renderBadgeContent);
    window.addEventListener("aicheck:profile-updated", renderBadgeContent);
    window.addEventListener("aicheck:lang-change", renderBadgeContent);
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  // ==========================================================================
  // G. NÚT CUỘN LÊN ĐẦU TRANG (BACK TO TOP)
  // ==========================================================================
  function initBackToTop() {
    if (document.getElementById("btnBackToTop")) return;
    const btn = document.createElement("button");
    btn.id = "btnBackToTop";
    btn.type = "button";
    btn.className = "back-to-top-btn";
    btn.setAttribute("aria-label", "Cuộn lên đầu trang");
    btn.innerHTML = `<span aria-hidden="true">↑</span>`;
    document.body.appendChild(btn);

    window.addEventListener("scroll", () => {
      if (window.scrollY > 280) {
        btn.classList.add("is-visible");
      } else {
        btn.classList.remove("is-visible");
      }
    }, { passive: true });

    btn.addEventListener("click", () => {
      window.AICheckAudio?.playClick();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ==========================================================================
  // G. TACTILE FEEDBACK & HEADER ELEVATION
  // ==========================================================================
  function initInteractiveFeedback() {
    document.addEventListener("pointerdown", (e) => {
      const target = e.target.closest(".button, .choice, .leader-tab, .filter, .bento-card");
      if (target) {
        target.style.transition = "transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)";
        target.style.transform = "scale(0.965)";
      }
    });

    const resetTransform = (e) => {
      const target = e.target.closest(".button, .choice, .leader-tab, .filter, .bento-card");
      if (target) {
        setTimeout(() => {
          target.style.transition = "";
          target.style.transform = "";
        }, 80);
      }
    };
    document.addEventListener("pointerup", resetTransform);
    document.addEventListener("pointercancel", resetTransform);
  }

  function initHeaderElevation() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 15) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }, { passive: true });
  }

  // ==========================================================================
  // H. SCROLL REVEAL 60 FPS
  // ==========================================================================
  function initScrollReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const revealSelectors = [
      ".portal-link",
      ".bento-card",
      ".risk-card",
      ".step-card",
      ".start-card",
      ".stage-card",
      ".fact",
      ".metric",
      ".forms-question-card",
      ".resource-card",
      ".faq-list details",
      ".home-about-points article"
    ];

    const targets = document.querySelectorAll(revealSelectors.join(","));
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -30px 0px"
    });

    targets.forEach((el, idx) => {
      el.classList.add("reveal-item");
      const delay = (idx % 5) * 0.07;
      el.style.setProperty("--reveal-delay", `${delay}s`);
      observer.observe(el);
    });
  }

  // ==========================================================================
  // I. BỘ ĐIỀU KHIỂN HIỆU ỨNG 3D CUBE LOADING (From Uiverse.io by dexter-st)
  // ==========================================================================
  const AICheckLoader = {
    getHtml() {
      return `<!-- From Uiverse.io by dexter-st --> 
<div class="wrapper-grid">
  <div class="cube">
    <div class="face face-front">L</div>
    <div class="face face-back"></div>
    <div class="face face-right"></div>
    <div class="face face-left"></div>
    <div class="face face-top"></div>
    <div class="face face-bottom"></div>
  </div>
  <div class="cube">
    <div class="face face-front">O</div>
    <div class="face face-back"></div>
    <div class="face face-right"></div>
    <div class="face face-left"></div>
    <div class="face face-top"></div>
    <div class="face face-bottom"></div>
  </div>
  <div class="cube">
    <div class="face face-front">A</div>
    <div class="face face-back"></div>
    <div class="face face-right"></div>
    <div class="face face-left"></div>
    <div class="face face-top"></div>
    <div class="face face-bottom"></div>
  </div>
  <div class="cube">
    <div class="face face-front">D</div>
    <div class="face face-back"></div>
    <div class="face face-right"></div>
    <div class="face face-left"></div>
    <div class="face face-top"></div>
    <div class="face face-bottom"></div>
  </div>
  <div class="cube">
    <div class="face face-front">I</div>
    <div class="face face-back"></div>
    <div class="face face-right"></div>
    <div class="face face-left"></div>
    <div class="face face-top"></div>
    <div class="face face-bottom"></div>
  </div>
  <div class="cube">
    <div class="face face-front">N</div>
    <div class="face face-back"></div>
    <div class="face face-right"></div>
    <div class="face face-left"></div>
    <div class="face face-top"></div>
    <div class="face face-bottom"></div>
  </div>
  <div class="cube">
    <div class="face face-front">G</div>
    <div class="face face-back"></div>
    <div class="face face-right"></div>
    <div class="face face-left"></div>
    <div class="face face-top"></div>
    <div class="face face-bottom"></div>
  </div>
</div>`;
    },
    show(message = "AI CHECK THĐ · Đang tải dữ liệu...") {
      let overlay = document.getElementById("siteLoaderOverlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "siteLoaderOverlay";
        overlay.className = "site-loader-overlay";
        overlay.innerHTML = `
          ${this.getHtml()}
          <div class="site-loader-message" id="siteLoaderMessage"></div>
        `;
        document.body.appendChild(overlay);
      }
      const msgEl = document.getElementById("siteLoaderMessage");
      if (msgEl) msgEl.textContent = message;
      overlay.classList.add("is-active");
    },
    hide() {
      const overlay = document.getElementById("siteLoaderOverlay");
      if (overlay) {
        overlay.classList.remove("is-active");
      }
    },
    initInlineLoaders() {
      document.querySelectorAll("[data-cube-loader]").forEach(el => {
        el.innerHTML = this.getHtml();
      });
    }
  };
  window.AICheckLoader = AICheckLoader;
  window.showLoadingAnimation = (msg) => AICheckLoader.show(msg);
  window.hideLoadingAnimation = () => AICheckLoader.hide();

  // Khởi chạy toàn bộ hệ thống
  function initAll() {
    initHamburgerNav();
    initLanguageSwitcher();
    initThemeSwitcher();
    attachAuthBadge();
    initUserProfileModal();
    initBackToTop();
    initInteractiveFeedback();
    initHeaderElevation();
    initScrollReveal();
    AICheckLoader.initInlineLoaders();
    AICheckI18n.applyTranslations();

    // Tự động dịch các nội dung được nạp động khi đang ở chế độ Tiếng Anh
    try {
      let _mutTimer = null;
      const _dynObserver = new MutationObserver((mutations) => {
        if (AICheckI18n.getLang() !== "en") return;
        let shouldTranslate = false;
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length > 0) {
            shouldTranslate = true;
            break;
          }
        }
        if (shouldTranslate) {
          clearTimeout(_mutTimer);
          _mutTimer = setTimeout(() => {
            AICheckI18n.translatePageContent("en");
          }, 120);
        }
      });
      _dynObserver.observe(document.body, { childList: true, subtree: true });
    } catch {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    setTimeout(initAll, 80);
  }
})();
