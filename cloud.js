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

  async function saveScore({ name, activity, score }) {
    if (!client) return { synced: false, reason: "not-configured" };
    const displayName = String(name || "Bạn").trim().slice(0, 24);
    if (!displayName || !["rubric", "assessment", "practice"].includes(activity) || !Number.isInteger(score) || score < 0 || score > 100) {
      return { synced: false, reason: "invalid-data" };
    }
    try {
      const { error } = await client.from("leaderboard_scores").insert({
        display_name: displayName,
        activity,
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
      rows: [...bestByName.values()].sort((left, right) => right.score - left.score).slice(0, 20)
    };
  }

  async function getResearchSummary() {
    if (!client) return { synced: false, row: null };
    try {
      const { data, error } = await client.from("research_summary").select("*").eq("id", 1).maybeSingle();
      return error ? { synced: false, row: null, error } : { synced: true, row: data };
    } catch (error) {
      return { synced: false, row: null, error };
    }
  }

  window.AICheckCloud = {
    configured,
    getDisplayName,
    saveScore,
    getLeaderboard,
    getResearchSummary
  };
})();
