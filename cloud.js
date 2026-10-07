(() => {
  const config = window.AICHECK_CONFIG || {};
  const sdk = window.supabase;
    const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey && sdk?.createClient);
  const client = configured 
    ? (window.supabaseClient || sdk.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      })) 
    : null;

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
      // 1. Tự động lấy địa chỉ IP của người dùng
      let userIp = 'Không xác định';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        userIp = ipData.ip;
      } catch (e) {
        console.warn('Không lấy được IP:', e);
      }

      // 2. Thực hiện đăng ký tài khoản Auth trên Supabase
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } }
      });

      // 3. Nếu đăng ký thành công, lưu dữ liệu vào bảng user_profiles
      if (!error && data?.user) {
        try {
          await client.from('user_profiles').insert([{
            id: data.user.id,
            email: email,
            display_name: displayName,
            role: 'student',
            register_ip: userIp
          }]);
        } catch (dbErr) {
          console.warn('Không thể ghi nhận profile:', dbErr);
        }

        if (displayName) {
          try { localStorage.setItem("aicheck:player", JSON.stringify(displayName.trim().slice(0, 24))); } catch {}
        }
      }

      return { data, error };
    } catch (err) {
      return { error: { message: err.message || "Lỗi đăng ký" } };
    }
  }

  async function signIn(email, password) {
    const cleanAccount = String(email || "").trim().toLowerCase();
    
    // Hỗ trợ đăng nhập trực tiếp tài khoản Quản trị viên cấp cao: tk: adminthd ; mk: THD2026
    if ((cleanAccount === "adminthd" || cleanAccount === "adminthd@thd.edu.vn" || cleanAccount === "adminthd@gmail.com") && password === "THD2026") {
      const adminUser = {
        id: "admin-thd-master-id",
        email: "adminthd@thd.edu.vn",
        user_metadata: {
          display_name: "Ban Quản trị THĐ",
          role: "admin",
          avatar: "👑"
        }
      };
      try {
        sessionStorage.setItem("aicheck:admin_unlocked", "true");
        sessionStorage.setItem("aicheck:master_admin_session", JSON.stringify(adminUser));
        localStorage.setItem("aicheck:master_admin_session", JSON.stringify(adminUser));
        localStorage.setItem("aicheck:user_profile", JSON.stringify({
          display_name: "Ban Quản trị THĐ",
          role: "admin",
          avatar: "👑",
          email: "adminthd@thd.edu.vn"
        }));
        localStorage.setItem("aicheck:player", JSON.stringify("Ban Quản trị THĐ"));
      } catch {}
      window.dispatchEvent(new CustomEvent("aicheck:profile-updated", { detail: { user: adminUser } }));
      return { data: { user: adminUser, session: { access_token: "master-adminthd-session" } }, error: null };
    }

    if (!client) return { error: { message: "Chưa cấu hình Supabase" } };
    try {
      const effectiveEmail = cleanAccount.includes("@") ? cleanAccount : `${cleanAccount}@thd.edu.vn`;
      const { data, error } = await client.auth.signInWithPassword({ email: effectiveEmail, password });
      if (!error && data?.user) {
        const name = data.user.user_metadata?.display_name || data.user.email?.split("@")[0] || "";
        if (name) {
          try { localStorage.setItem("aicheck:player", JSON.stringify(name.trim().slice(0, 24))); } catch {}
        }
        processSyncQueue(); // Thử sync ngay sau khi login

        // Đồng bộ và kiểm tra chuỗi ngày đăng nhập nếu có gamification engine
        try {
          if (data.user.user_metadata?.gamification && window.AICheckGamification?.restoreFromCloud) {
            window.AICheckGamification.restoreFromCloud(data.user.user_metadata.gamification);
          }
          if (window.AICheckGamification?.checkDailyLoginStreak) {
            window.AICheckGamification.checkDailyLoginStreak(data.user);
          }
        } catch (e) {
          console.warn("Lỗi kiểm tra chuỗi đăng nhập:", e);
        }
      }
      return { data, error };
    } catch (err) {
      return { error: { message: err.message || "Lỗi đăng nhập" } };
    }
  }

  // --- ĐĂNG NHẬP OAUTH (GOOGLE & FACEBOOK) ---
  async function signInWithOAuth(provider) {
    if (!client) return { error: { message: "Chưa cấu hình kết nối Supabase Cloud" } };
    try {
      if (window.location.protocol === 'file:') {
        return {
          error: {
            message: "Tính năng đăng nhập Google/Facebook yêu cầu chạy website qua giao thức web HTTP/HTTPS (ví dụ: Live Server, localhost, Netlify, Vercel...), không thể chạy trực tiếp từ file:// trong máy tính."
          }
        };
      }

      // Xác định URL chuyển hướng về trang chủ
      const isPagesDir = location.pathname.includes("/pages/");
      let redirectPath = isPagesDir 
        ? location.pathname.replace(/\/pages\/[^/]+$/i, '/index.html')
        : location.pathname.replace(/login\.html$/i, 'index.html');
      
      if (!redirectPath.endsWith(".html") && !redirectPath.endsWith("/")) {
        redirectPath += "/";
      }

      const redirectUrl = new URL(redirectPath, window.location.origin).href;

      const { data, error } = await client.auth.signInWithOAuth({
        provider: provider, // 'google' | 'facebook'
        options: {
          redirectTo: redirectUrl,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent'
          } : undefined
        }
      });

      return { data, error };
    } catch (err) {
      return { error: { message: err.message || "Lỗi kết nối OAuth" } };
    }
  }

  // Tự động lắng nghe và đồng bộ thông tin khi đăng nhập (đặc biệt khi hoàn tất Google / Apple OAuth)
  if (client?.auth?.onAuthStateChange) {
    client.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const user = session.user;
        const oauthName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || user.email?.split("@")[0] || "";
        const oauthAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        if (oauthName) {
          try { localStorage.setItem("aicheck:player", JSON.stringify(oauthName.trim().slice(0, 24))); } catch {}
        }
        if (oauthAvatar) {
          try { localStorage.setItem("aicheck:avatar", oauthAvatar); } catch {}
        }

        // Tự động tạo hoặc cập nhật hồ sơ trong bảng user_profiles
        try {
          const { data: profile } = await client.from('user_profiles').select('id, display_name, avatar').eq('id', user.id).maybeSingle();
          if (!profile) {
            let userIp = 'Không xác định';
            try {
              const ipRes = await fetch('https://api.ipify.org?format=json');
              const ipData = await ipRes.json();
              userIp = ipData.ip;
            } catch {}
            await client.from('user_profiles').insert([{
              id: user.id,
              email: user.email,
              display_name: oauthName,
              avatar: oauthAvatar || "🎓",
              role: 'student',
              register_ip: userIp
            }]);
          } else if (oauthAvatar && !profile.avatar) {
            await client.from('user_profiles').update({ avatar: oauthAvatar }).eq('id', user.id);
          }
        } catch (err) {
          console.warn("Lưu profile OAuth:", err);
        }

        // Đồng bộ gamification nếu có
        try {
          if (user.user_metadata?.gamification && window.AICheckGamification?.restoreFromCloud) {
            window.AICheckGamification.restoreFromCloud(user.user_metadata.gamification);
          }
          if (window.AICheckGamification?.checkDailyLoginStreak) {
            window.AICheckGamification.checkDailyLoginStreak(user);
          }
        } catch {}

        window.dispatchEvent(new CustomEvent("aicheck:profile-updated", { detail: { user } }));
      }
    });
  }

  async function signOut() {
    try {
      sessionStorage.removeItem("aicheck:master_admin_session");
      sessionStorage.removeItem("aicheck:admin_unlocked");
      localStorage.removeItem("aicheck:master_admin_session");
      localStorage.removeItem("aicheck:admin_unlocked");
      if (client) await client.auth.signOut();
    } catch {}
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
    const isPagesDir = location.pathname.includes("/pages/");
    location.href = isPagesDir ? "../login.html" : "login.html";
  }

  async function getUser() {
    // 1. Kiểm tra session của Master Admin (adminthd)
    try {
      const masterAdminRaw = sessionStorage.getItem("aicheck:master_admin_session") || localStorage.getItem("aicheck:master_admin_session");
      if (masterAdminRaw) {
        return JSON.parse(masterAdminRaw);
      }
    } catch {}

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
    if (!user) return false;
    if (user.id === "admin-thd-master-id") return true;
    if (!user.email) return false;
    const email = user.email.toLowerCase();
    const adminEmails = [
      "adminthd@thd.edu.vn",
      "admin@aicheck.thd",
      "admin@thd.edu.vn",
      "giaovien@thd.edu.vn",
      "kaigegm@gmail.com",
      "thd.aicheck@gmail.com"
    ];
    return adminEmails.includes(email) || email.startsWith("adminthd") || user.user_metadata?.role === "admin";
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
    if (!displayName || !["rubric", "assessment", "practice", "exam"].includes(activity) || !Number.isInteger(score) || score < 0 || score > 100 || (activity === "assessment" && !["pre", "post"].includes(phase))) {
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

  // --- HỆ THỐNG HỒ SƠ CÁ NHÂN (USER PROFILE & SETTINGS) ---
  async function getProfile() {
    let local = {};
    try { local = JSON.parse(localStorage.getItem("aicheck:user_profile") || "{}"); } catch {}

    const user = await getUser();
    if (!user) {
      return { data: Object.keys(local).length ? local : null, error: null };
    }

    const defaultProfile = {
      id: user.id,
      email: user.email,
      display_name: local.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Học sinh",
      avatar: local.avatar || user.user_metadata?.avatar || "🎓",
      class_name: local.class_name || user.user_metadata?.class_name || "",
      school: local.school || user.user_metadata?.school || "THPT Trần Hưng Đạo",
      birthdate: local.birthdate || user.user_metadata?.birthdate || "",
      bio: local.bio || user.user_metadata?.bio || "",
      student_id: local.student_id || user.user_metadata?.student_id || "",
      gender: local.gender || user.user_metadata?.gender || "",
      phone: local.phone || user.user_metadata?.phone || "",
      city: local.city || user.user_metadata?.city || "",
      favorite_subject: local.favorite_subject || user.user_metadata?.favorite_subject || "",
      target_goal: local.target_goal || user.user_metadata?.target_goal || ""
    };

    if (!client) {
      localStorage.setItem("aicheck:user_profile", JSON.stringify(defaultProfile));
      return { data: defaultProfile, error: null };
    }

    try {
      const { data, error } = await client.from("user_profiles").select("*").eq("id", user.id).maybeSingle();
      if (data && !error) {
        const merged = {
          ...defaultProfile,
          ...data,
          ...local
        };
        localStorage.setItem("aicheck:user_profile", JSON.stringify(merged));
        return { data: merged, error: null };
      }
    } catch (e) {
      console.warn("Không thể tải bảng user_profiles, dùng auth metadata:", e);
    }

    localStorage.setItem("aicheck:user_profile", JSON.stringify(defaultProfile));
    return { data: defaultProfile, error: null };
  }

  async function updateProfile(fields) {
    let current = {};
    try { current = JSON.parse(localStorage.getItem("aicheck:user_profile") || "{}"); } catch {}
    const updated = {
      ...current,
      ...fields,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem("aicheck:user_profile", JSON.stringify(updated));
    if (fields.display_name) {
      try {
        localStorage.setItem("aicheck:player", JSON.stringify(fields.display_name.trim().slice(0, 24)));
      } catch {}
    }
    if (fields.avatar) {
      try {
        localStorage.setItem("aicheck:avatar", fields.avatar);
      } catch {}
    }

    if (!client) {
      return { data: updated, error: null, local: true };
    }

    try {
      const user = await getUser();
      if (!user) return { data: updated, error: null, local: true };

      // 1. Cập nhật Auth user_metadata
      const { error: authErr } = await client.auth.updateUser({
        data: {
          ...(user.user_metadata || {}),
          ...fields
        }
      });
      if (authErr) console.warn("Lỗi updateUser Auth:", authErr);

      // 2. Cập nhật bảng user_profiles
      try {
        await client.from("user_profiles").upsert({
          id: user.id,
          email: user.email,
          display_name: fields.display_name,
          avatar: fields.avatar,
          class_name: fields.class_name,
          school: fields.school,
          birthdate: fields.birthdate || null,
          bio: fields.bio,
          updated_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("Lỗi upsert bảng user_profiles:", dbErr);
      }

      return { data: updated, error: null };
    } catch (err) {
      return { data: updated, error: err };
    }
  }

  async function updatePassword(newPassword, currentPassword) {
    if (!client) return { error: { message: "Chưa cấu hình kết nối Supabase Cloud" } };
    try {
      const user = await getUser();
      if (!user) return { error: { message: "Bạn chưa đăng nhập vào hệ thống" } };

      if (currentPassword) {
        const { error: verifyErr } = await client.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        });
        if (verifyErr) {
          return { error: { message: "Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại!" } };
        }
      }

      const { data, error } = await client.auth.updateUser({ password: newPassword });
      return { data, error };
    } catch (err) {
      return { error: { message: err.message || "Lỗi cập nhật mật khẩu" } };
    }
  }

  async function syncGamification(gamifyData) {
    if (!client || !gamifyData) return { synced: false };
    try {
      const user = await getUser();
      if (!user) return { synced: false, reason: "not-logged-in" };
      const { error } = await client.auth.updateUser({
        data: { gamification: gamifyData }
      });
      if (error) throw error;
      return { synced: true };
    } catch (e) {
      console.warn("Lỗi đồng bộ Gamification lên Cloud:", e);
      return { synced: false, error: e };
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
    signInWithOAuth,
    signOut,
    getUser,
    isAdmin,
    getProfile,
    updateProfile,
    updatePassword,
    sendSupportRequest,
    resolveSupportRequest,
    getLocalSupportRequests,
    processSyncQueue,
    syncGamification
  };
})();
