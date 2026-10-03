(() => {
  const config = window.AICHECK_CONFIG || {};
  const sdk = window.supabase;
  const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey && sdk?.createClient);
  const client = configured ? sdk.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

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
      return error ? { synced: false, reason: "request-failed", error } : { synced: true };
    } catch (error) {
      return { synced: false, reason: "request-failed", error };
    }
  }

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
    getDisplayName,
    getPlayerNameState,
    savePlayerName,
    getParticipantId,
    saveScore,
    getLeaderboard,
    subscribeLeaderboard,
    getResearchSummary
  };
})();
