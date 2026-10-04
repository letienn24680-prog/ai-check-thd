(() => {
  const config = window.AICHECK_CONFIG || {};
  const sdk = window.supabase;
    const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey && sdk?.createClient);
  const client = configured ? sdk.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

  // --- HỆ THỐNG OFFLINE QUEUE ---
  function getSyncQueue() {
    try { return JSON.parse(localStorage.getItem("aicheck:sync_queue") || "[]"); } catch { return []; }
  }
  function addToSyncQueue(data) {
    const queue = getSyncQueue();
    queue.push({ ...data, queued_at: new Date().toISOString() });
    localStorage.setItem("aicheck:sync_queue", JSON.stringify(queue));
  }
  async function processSyncQueue() {
    if (!client || !navigator.onLine) return;
    const queue = getSyncQueue();
    if (queue.length === 0) return;

    const remaining = [];
    for (const item of queue) {
      try {
        const { error } = await client.from("leaderboard_scores").insert({
          participant_id: item.participant_id,
          display_name: item.display_name,
          activity: item.activity,
          phase: item.phase,
          score: item.score,
          created_at: item.queued_at // Giữ nguyên thời gian lúc làm bài
        });
        if (error) throw error;
      } catch (e) {
        remaining.push(item);
      }
    }
    localStorage.setItem("aicheck:sync_queue", JSON.stringify(remaining));
  }

  // --- HỆ THỐNG AUTH ---
  async function signUp(email, password, displayName) {
    if (!client) return { error: { message: "Chưa cấu hình Supabase" } };
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } }
      });
      if (!error && displayName) {
        try { localStorage.setItem("aicheck:player", JSON.stringify(displayName.trim().slice(0, 24))); } catch {}
      }
      return { data, error };
    } catch (err) {
      return { error: { message: err.message || "Lỗi đăng ký" } };
    }
  }

  async function signIn(email, password) {
    if (!client) return { error: { message: "Chưa cấu hình Supabase" } };
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        const name = data.user.user_metadata?.display_name || data.user.email?.split("@")[0] || "";
        if (name) {
          try { localStorage.setItem("aicheck:player", JSON.stringify(name.trim().slice(0, 24))); } catch {}
        }
        processSyncQueue(); // Thử sync ngay sau khi login
      }
      return { data, error };
    } catch (err) {
      return { error: { message: err.message || "Lỗi đăng nhập" } };
    }
  }

  async function signOut() {
    if (!client) return;
    try { await client.auth.signOut(); } catch {}
    location.reload();
  }

  async function getUser() {
    if (!client) return null;
    try {
      const { data, error } = await client.auth.getUser();
      if (error || !data) return null;
      return data.user;
    } catch {
      return null;
    }
  }

  function getLocalSupportRequests() {
    try { return JSON.parse(localStorage.getItem("aicheck:local_support_requests") || "[]"); } catch { return []; }
  }

  function saveLocalSupportRequest(item) {
    const list = getLocalSupportRequests();
    list.unshift(item);
    localStorage.setItem("aicheck:local_support_requests", JSON.stringify(list));
  }

  async function sendSupportRequest(email, name, reason) {
    const localItem = {
      id: "local_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      user_email: String(email || "").trim(),
      display_name: String(name || "").trim(),
      reason: String(reason || "").trim(),
      status: "pending",
      created_at: new Date().toISOString()
    };

    if (!client) {
      saveLocalSupportRequest(localItem);
      return { data: localItem, error: null, local: true };
    }

    try {
      const { data, error } = await client.from("support_requests").insert({
        user_email: localItem.user_email,
        display_name: localItem.display_name,
        reason: localItem.reason
      });
      if (error) {
        // Fallback lưu cục bộ nếu bảng chưa tạo trên Supabase
        saveLocalSupportRequest(localItem);
        return { data: localItem, error: null, local: true };
      }
      return { data, error: null };
    } catch (err) {
      saveLocalSupportRequest(localItem);
      return { data: localItem, error: null, local: true };
    }
  }

  async function resolveSupportRequest(id) {
    // Xử lý local
    const localList = getLocalSupportRequests();
    const found = localList.find(r => r.id === id);
    if (found) {
      found.status = "resolved";
      localStorage.setItem("aicheck:local_support_requests", JSON.stringify(localList));
      return { success: true };
    }
    // Xử lý Supabase
    if (client) {
      try {
        const { error } = await client.from("support_requests").update({ status: "resolved" }).eq("id", id);
        return { success: !error, error };
      } catch (err) {
        return { success: false, error: err };
      }
    }
    return { success: false };
  }

  function isAdmin(user) {
    if (!user || !user.email) return false;
    const email = user.email.toLowerCase();
    const adminEmails = [
      "admin@aicheck.thd",
      "admin@thd.edu.vn",
      "giaovien@thd.edu.vn",
      "kaigegm@gmail.com",
      "thd.aicheck@gmail.com"
    ];
    return adminEmails.includes(email) || user.user_metadata?.role === "admin";
  }

  function getDisplayName(fallback = "") {
    let savedName = "";
    try { savedName = JSON.parse(localStorage.getItem("aicheck:player") || "\"\""); } catch {}
    const enteredName = String(fallback || "").trim();
    if (savedName) return savedName.slice(0, 24);
    if (enteredName) return enteredName.slice(0, 24);
    let guestName = localStorage.getItem("aicheck:guestName");
    if (!guestName) {
      guestName = `Học sinh ${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem("aicheck:guestName", guestName);
    }
    return guestName;
  }

  const NAME_CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

  function getPlayerNameState() {
    let name = "";
    try { name = JSON.parse(localStorage.getItem("aicheck:player") || "\"\""); } catch {}
    if (!name) return { name: "", canChange: true, nextChangeAt: null, remainingMs: 0 };

    let changedAt = Number(localStorage.getItem("aicheck:playerChangedAt"));
    if (!Number.isFinite(changedAt) || changedAt <= 0) {
      changedAt = Date.now();
      localStorage.setItem("aicheck:playerChangedAt", String(changedAt));
    }
    const nextChangeAt = changedAt + NAME_CHANGE_COOLDOWN_MS;
    const remainingMs = Math.max(0, nextChangeAt - Date.now());
    return { name, canChange: remainingMs === 0, nextChangeAt, remainingMs };
  }

  function savePlayerName(value) {
    const name = String(value || "").trim().slice(0, 24);
    if (!name) return { saved: false, reason: "empty" };

    const current = getPlayerNameState();
    if (current.name && current.name.toLocaleLowerCase() === name.toLocaleLowerCase()) {
      return { saved: true, changed: false, ...current };
    }
    if (current.name && !current.canChange) {
      return { saved: false, reason: "cooldown", ...current };
    }

    const changedAt = Date.now();
    localStorage.setItem("aicheck:player", JSON.stringify(name));
    localStorage.setItem("aicheck:playerChangedAt", String(changedAt));
    return {
      saved: true,
      changed: true,
      name,
      canChange: false,
      nextChangeAt: changedAt + NAME_CHANGE_COOLDOWN_MS,
      remainingMs: NAME_CHANGE_COOLDOWN_MS
    };
  }

  function getParticipantId() {
    let participantId = localStorage.getItem("aicheck:participantId");
    if (!participantId) {
      participantId = crypto.randomUUID();
      localStorage.setItem("aicheck:participantId", participantId);
    }
    return participantId;
  }

  async function saveScore({ name, activity, score, phase = null }) {
    if (!client) return { synced: false, reason: "not-configured" };
    const displayName = String(name || "Bạn").trim().slice(0, 24);
    if (!displayName || !["rubric", "assessment", "practice"].includes(activity) || !Number.isInteger(score) || score < 0 || score > 100 || (activity === "assessment" && !["pre", "post"].includes(phase))) {
      return { synced: false, reason: "invalid-data" };
    }
        try {
      const { error } = await client.from("leaderboard_scores").insert({
        participant_id: getParticipantId(),
        display_name: displayName,
        activity,
        phase: activity === "assessment" ? phase : null,
        score
      });
      if (error) {
        addToSyncQueue({ participant_id: getParticipantId(), display_name: displayName, activity, phase, score });
        return { synced: false, reason: "request-failed", offline: true };
      }
      return { synced: true };
    } catch (error) {
      addToSyncQueue({ participant_id: getParticipantId(), display_name: displayName, activity, phase, score });
      return { synced: false, reason: "request-failed", error, offline: true };
    }
  }

  // Tự động sync khi online trở lại
  window.addEventListener("online", processSyncQueue);
  if (configured) setTimeout(processSyncQueue, 2000);

  async function getLeaderboard(activity) {
    if (!client) return { synced: false, rows: [] };
    let data, error;
    try {
      ({ data, error } = await client
        .from("leaderboard_scores")
        .select("display_name, activity, score, created_at")
        .eq("activity", activity)
        .order("score", { ascending: false })
        .limit(1000));
    } catch (requestError) {
      return { synced: false, rows: [], error: requestError };
    }
    if (error) return { synced: false, rows: [], error };

    const bestByName = new Map();
    for (const row of data || []) {
      const key = row.display_name.trim().toLocaleLowerCase();
      const current = bestByName.get(key);
      if (!current || row.score > current.score) {
        bestByName.set(key, {
          name: row.display_name,
          score: row.score,
          date: row.created_at?.slice(0, 10) || ""
        });
      }
    }
    return {
      synced: true,
      rows: [...bestByName.values()].sort((left, right) => right.score - left.score || right.date.localeCompare(left.date)).slice(0, 20)
    };
  }

  function subscribeLeaderboard(activity, onChange, onStatus = () => {}) {
    if (!client) return null;
    const channel = client
      .channel(`leaderboard-${activity}-${crypto.randomUUID()}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "leaderboard_scores",
        filter: `activity=eq.${activity}`
      }, onChange)
      .subscribe(onStatus);
    return () => client.removeChannel(channel);
  }

  async function getResearchSummary() {
    if (!client) return { synced: false, row: null };
    try {
      const { data, error } = await client
        .from("research_assessment_summary")
        .select("phase, participant_count, average_score, good_count, good_rate_pct, updated_at, attempt_count");
      return error ? { synced: false, rows: [], error } : { synced: true, rows: data || [] };
    } catch (error) {
      return { synced: false, rows: [], error };
    }
  }

  window.AICheckCloud = {
    configured,
    client,
    getDisplayName,
    getPlayerNameState,
    savePlayerName,
    getParticipantId,
    saveScore,
    getLeaderboard,
    subscribeLeaderboard,
    getResearchSummary,
    // Auth & Quản trị
    signUp,
    signIn,
    signOut,
    getUser,
    isAdmin,
    sendSupportRequest,
    resolveSupportRequest,
    getLocalSupportRequests,
    processSyncQueue
  };
})();
