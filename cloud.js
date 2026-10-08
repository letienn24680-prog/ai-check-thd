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

    const effectiveEmail = cleanAccount.includes("@") ? cleanAccount : `${cleanAccount}@thd.edu.vn`;

    // 0. Kiểm tra trạng thái khóa tài khoản do tranh chấp thiết bị (kiểm tra cả local và cloud)
    let lockCheck = AICheckSessionManager.getAccountLock(effectiveEmail);
    if (!lockCheck && AICheckSessionManager.getAccountLockRemote) {
      try {
        lockCheck = await AICheckSessionManager.getAccountLockRemote(effectiveEmail);
      } catch {}
    }
    if (lockCheck) {
      if (lockCheck.status === "locked") {
        return {
          error: {
            message: "Tài khoản đang bị tạm khóa do sự cố tranh chấp đăng nhập liên tục giữa nhiều thiết bị.",
            isAccountLocked: true,
            lockStatus: "locked",
            accountEmail: effectiveEmail,
            lockData: lockCheck
          }
        };
      } else if (lockCheck.status === "unlock_pending") {
        return {
          error: {
            message: "Tài khoản đã được Quản trị viên cấp mã mở khóa. Vui lòng nhập mã mở khóa để tiếp tục.",
            isAccountLocked: true,
            lockStatus: "unlock_pending",
            accountEmail: effectiveEmail,
            lockData: lockCheck
          }
        };
      }
    }

    if (!client) return { error: { message: "Chưa cấu hình Supabase" } };
    try {
      const { data, error } = await client.auth.signInWithPassword({ email: effectiveEmail, password });
      if (!error && data?.user) {
        // ĐĂNG KÝ PHIÊN THIẾT BỊ & PHÁT HIỆN TRANH CHẤP LIÊN TỤC (ĐỒNG BỘ ĐA THIẾT BỊ)
        const sessionReg = await AICheckSessionManager.registerLogin(effectiveEmail, data.user);
        if (sessionReg.locked) {
          try { await client.auth.signOut(); } catch {}
          return {
            error: {
              message: sessionReg.message,
              isAccountLocked: true,
              justLocked: true,
              lockStatus: "locked",
              accountEmail: effectiveEmail,
              lockData: sessionReg.lock
            }
          };
        }

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
      localStorage.removeItem("aicheck:active_session_id");
      localStorage.removeItem("aicheck:active_account");
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

  // =========================================================================
  // HỆ THỐNG ĐỒNG BỘ ĐA THIẾT BỊ (SUPABASE REALTIME & CLOUD SHARED STORE)
  // =========================================================================
  const REALTIME_GLOBAL_CHANNEL = "aicheck_global_channel";
  const CLOUD_SYNC_OBJECT_ID = "ff808181a09d98f701a11b980f4520ea";
  const CLOUD_SYNC_API_URL = "https://api.restful-api.dev/objects/" + CLOUD_SYNC_OBJECT_ID;

  let globalRealtimeChannel = null;
  function getRealtimeChannel() {
    if (globalRealtimeChannel) return globalRealtimeChannel;
    if (client && client.channel) {
      try {
        globalRealtimeChannel = client.channel(REALTIME_GLOBAL_CHANNEL, {
          config: { broadcast: { self: false } }
        });
        globalRealtimeChannel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("⚡ [Realtime] Kết nối kênh toàn cầu:", REALTIME_GLOBAL_CHANNEL);
          }
        });
      } catch (e) {
        console.warn("Lỗi khởi tạo Supabase Realtime channel:", e);
      }
    }
    return globalRealtimeChannel;
  }

  // Tự động khởi chạy kênh realtime
  try {
    if (client) getRealtimeChannel();
  } catch {}

  // Giao tiếp qua Supabase Realtime Broadcast đa thiết bị
  function broadcastGlobalRealtime(eventName, payload) {
    try {
      const ch = getRealtimeChannel();
      if (ch) {
        ch.send({
          type: "broadcast",
          event: eventName,
          payload: payload
        });
      }
    } catch (e) {
      console.warn("Lỗi gửi Supabase Realtime broadcast:", e);
    }
  }

  // Đọc dữ liệu chia sẻ đa thiết bị từ Cloud Shared Object Store
  async function fetchCloudSharedData() {
    try {
      const res = await fetch(CLOUD_SYNC_API_URL);
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (e) {
      console.warn("Lỗi đọc Cloud Shared Store:", e);
      return null;
    }
  }

  // Ghi / Cập nhật dữ liệu chia sẻ đa thiết bị lên Cloud Shared Object Store
  async function updateCloudSharedData(updaterFn) {
    try {
      let currentData = await fetchCloudSharedData();
      if (!currentData || typeof currentData !== "object") {
        currentData = { support_requests: [], account_locks: {}, sessions: {} };
      }
      const updatedData = updaterFn(currentData) || currentData;
      const res = await fetch(CLOUD_SYNC_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "aicheck_shared_database",
          data: updatedData
        })
      });
      return res.ok;
    } catch (e) {
      console.warn("Lỗi cập nhật Cloud Shared Store:", e);
      return false;
    }
  }

  function getLocalSupportRequests() {
    try { return JSON.parse(localStorage.getItem("aicheck:local_support_requests") || "[]"); } catch { return []; }
  }

  function saveLocalSupportRequest(item) {
    const list = getLocalSupportRequests();
    const idx = list.findIndex(r => r.id === item.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
    } else {
      list.unshift(item);
    }
    localStorage.setItem("aicheck:local_support_requests", JSON.stringify(list));
  }

  async function getAllCloudSupportRequests() {
    const cloudData = await fetchCloudSharedData();
    return Array.isArray(cloudData?.support_requests) ? cloudData.support_requests : [];
  }

  async function sendSupportRequest(email, name, reason) {
    const localItem = {
      id: "req_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      user_email: String(email || "").trim(),
      display_name: String(name || "").trim(),
      reason: String(reason || "").trim(),
      status: "pending",
      created_at: new Date().toISOString()
    };

    // 1. Lưu cục bộ bộ nhớ đệm
    saveLocalSupportRequest(localItem);

    // 2. Lưu lên Cloud Shared Store để Admin xem được trên mọi thiết bị
    try {
      await updateCloudSharedData(data => {
        data.support_requests = data.support_requests || [];
        data.support_requests = data.support_requests.filter(r => r.id !== localItem.id);
        data.support_requests.unshift(localItem);
        return data;
      });
    } catch (e) {
      console.warn("Lỗi lưu support request lên Cloud Store:", e);
    }

    // 3. Phát sóng Supabase Realtime broadcast đến bảng điều khiển Admin đang mở
    broadcastGlobalRealtime("SUPPORT_UNLOCK_REQUEST", localItem);

    // 4. Thử chèn vào bảng Supabase support_requests nếu bảng đã tồn tại
    if (client) {
      try {
        await client.from("support_requests").insert({
          user_email: localItem.user_email,
          display_name: localItem.display_name,
          reason: localItem.reason
        });
      } catch (err) {}
    }

    return { data: localItem, error: null };
  }

  async function resolveSupportRequest(id) {
    // 1. Cập nhật local
    const localList = getLocalSupportRequests();
    const found = localList.find(r => r.id === id);
    if (found) {
      found.status = "resolved";
      localStorage.setItem("aicheck:local_support_requests", JSON.stringify(localList));
    }

    // 2. Cập nhật Cloud Shared Store
    await updateCloudSharedData(data => {
      data.support_requests = data.support_requests || [];
      const item = data.support_requests.find(r => r.id === id);
      if (item) item.status = "resolved";
      return data;
    });

    // 3. Phát sóng Realtime
    broadcastGlobalRealtime("SUPPORT_REQUEST_RESOLVED", { id, status: "resolved" });

    // 4. Cập nhật Supabase nếu có
    if (client) {
      try {
        await client.from("support_requests").update({ status: "resolved" }).eq("id", id);
      } catch {}
    }

    return { success: true };
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

  // =========================================================================
  // SINGLE ACTIVE SESSION & CONFLICT LOCK MANAGER (QUẢN LÝ 1 TK - 1 THIẾT BỊ)
  // =========================================================================
  const SESSION_STORE_KEY = "aicheck:account_sessions";
  const LOCKS_STORE_KEY = "aicheck:account_locks";
  const MY_SESSION_KEY = "aicheck:active_session_id";
  const MY_ACCOUNT_KEY = "aicheck:active_account";
  const BROADCAST_CHANNEL_NAME = "aicheck_session_channel";

  let sessionBroadcastChannel = null;
  try {
    if (typeof window !== "undefined" && window.BroadcastChannel) {
      sessionBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    }
  } catch {}

  const AICheckSessionManager = {
    // 1. Nhận diện thiết bị và trình duyệt
    getDeviceInfo() {
      const ua = navigator.userAgent || "";
      let os = "Không xác định";
      if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
      else if (/windows/i.test(ua)) os = "Windows";
      else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
      else if (/android/i.test(ua)) os = "Android";
      else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
      else if (/linux/i.test(ua)) os = "Linux";

      let browser = "Trình duyệt";
      if (/edg\//i.test(ua)) browser = "Microsoft Edge";
      else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) browser = "Google Chrome";
      else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Apple Safari";
      else if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";
      else if (/opera|opr/i.test(ua)) browser = "Opera";

      const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
      const devType = isMobile ? "📱 Di động" : "💻 Máy tính";
      return `${devType} (${os} · ${browser})`;
    },

    getAllSessions() {
      try {
        const raw = localStorage.getItem(SESSION_STORE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
      return {};
    },

    saveAllSessions(data) {
      try {
        localStorage.setItem(SESSION_STORE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn("Lỗi lưu account sessions:", e);
      }
    },

    getAllLocks() {
      try {
        const raw = localStorage.getItem(LOCKS_STORE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
      return {};
    },

    saveAllLocks(data) {
      try {
        localStorage.setItem(LOCKS_STORE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn("Lỗi lưu account locks:", e);
      }
    },

    normalizeAccount(acc) {
      return String(acc || "").toLowerCase().trim();
    },

    getAccountLock(account) {
      const acc = this.normalizeAccount(account);
      if (!acc) return null;
      const locks = this.getAllLocks();
      return locks[acc] || null;
    },

    async getAccountLockRemote(account) {
      const acc = this.normalizeAccount(account);
      if (!acc) return null;
      try {
        const cloudData = await fetchCloudSharedData();
        if (cloudData?.account_locks && cloudData.account_locks[acc]) {
          const remoteLock = cloudData.account_locks[acc];
          // Đồng bộ vào local
          const localLocks = this.getAllLocks();
          localLocks[acc] = remoteLock;
          this.saveAllLocks(localLocks);
          return remoteLock;
        }
      } catch (e) {
        console.warn("Lỗi đọc lock remote:", e);
      }
      return null;
    },

    async setAccountLock(account, lockData) {
      const acc = this.normalizeAccount(account);
      if (!acc) return;
      const locks = this.getAllLocks();
      if (!lockData) {
        delete locks[acc];
      } else {
        locks[acc] = {
          ...locks[acc],
          ...lockData,
          account: acc,
          updatedAt: Date.now()
        };
      }
      this.saveAllLocks(locks);

      // Cập nhật Cloud Shared Store
      try {
        await updateCloudSharedData(d => {
          d.account_locks = d.account_locks || {};
          if (lockData) {
            d.account_locks[acc] = locks[acc];
          } else {
            delete d.account_locks[acc];
          }
          return d;
        });
      } catch {}

      // Phát sóng toàn cầu
      broadcastGlobalRealtime("ACCOUNT_LOCK_UPDATE", {
        account: acc,
        lock: locks[acc] || null
      });

      this.broadcastMessage({
        type: "ACCOUNT_LOCK_UPDATE",
        account: acc,
        lock: locks[acc] || null
      });
    },

    async clearAccountLock(account) {
      const acc = this.normalizeAccount(account);
      if (!acc) return;
      const locks = this.getAllLocks();
      delete locks[acc];
      this.saveAllLocks(locks);

      // Xóa trong Cloud Shared Store
      try {
        await updateCloudSharedData(d => {
          if (d.account_locks) delete d.account_locks[acc];
          return d;
        });
      } catch {}

      const sessions = this.getAllSessions();
      if (sessions[acc]) {
        sessions[acc].conflictCount = 0;
        sessions[acc].switchHistory = [];
        this.saveAllSessions(sessions);
      }

      broadcastGlobalRealtime("ACCOUNT_UNLOCKED", { account: acc });

      this.broadcastMessage({
        type: "ACCOUNT_UNLOCKED",
        account: acc
      });
    },

    // 2. Đăng ký phiên đăng nhập mới & phát hiện tranh chấp liên tục (Cross-Device)
    async registerLogin(account, userObj) {
      const acc = this.normalizeAccount(account);
      if (!acc) return { success: false, message: "Tài khoản không hợp lệ" };

      // Tài khoản Quản trị viên cấp cao được miễn trừ kiểm tra khóa tranh chấp
      if (acc === "adminthd" || acc === "adminthd@thd.edu.vn" || acc === "adminthd@gmail.com" || userObj?.id === "admin-thd-master-id") {
        return { success: true };
      }

      // A. Kiểm tra tài khoản có đang bị khóa hay không (cả local và remote)
      let currentLock = this.getAccountLock(acc);
      if (!currentLock) {
        try { currentLock = await this.getAccountLockRemote(acc); } catch {}
      }

      if (currentLock) {
        if (currentLock.status === "locked") {
          return {
            success: false,
            locked: true,
            status: "locked",
            lock: currentLock,
            message: "Tài khoản đang bị tạm khóa do sự cố tranh chấp đăng nhập liên tục giữa nhiều thiết bị."
          };
        } else if (currentLock.status === "unlock_pending") {
          return {
            success: false,
            locked: true,
            status: "unlock_pending",
            lock: currentLock,
            message: "Tài khoản đã được Quản trị viên cấp mã mở khóa. Vui lòng nhập mã mở khóa để tiếp tục."
          };
        }
      }

      // B. Kiểm tra phiên cũ từ thiết bị khác và tính toán tranh chấp liên tục
      const now = Date.now();
      const myDeviceInfo = this.getDeviceInfo();
      const mySessionId = "sess_" + now + "_" + Math.random().toString(36).substring(2, 9);
      const lastMySession = localStorage.getItem(MY_SESSION_KEY);

      const meta = userObj?.user_metadata || {};
      const prevSessionId = meta.active_session_id;
      const prevDevice = meta.active_device;
      const prevTime = meta.session_time || 0;
      const prevConflict = meta.conflict_count || 0;

      let conflictCount = prevConflict;

      if (prevSessionId && prevSessionId !== lastMySession) {
        // Phiên trước đó là từ một thiết bị/trình duyệt khác!
        const timeSincePrev = now - prevTime;

        // Nếu lượt đổi phiên diễn ra dồn dập trong vòng 5 phút (300,000 ms)
        if (timeSincePrev < 300000) {
          conflictCount = prevConflict + 1;
        } else {
          conflictCount = 1;
        }

        // 🛑 TRANH CHẤP LIÊN TỤC >= 3 LẦN TRONG 5 PHÚT -> TỰ ĐỘNG KHÓA TÀI KHOẢN TOÀN CẦU!
        if (conflictCount >= 3) {
          const lockPayload = {
            status: "locked",
            reason: "device_conflict",
            lockedAt: now,
            conflictCount: conflictCount,
            account: acc,
            displayName: meta.display_name || userObj?.display_name || acc,
            deviceInfo: myDeviceInfo,
            lastDevice: prevDevice || myDeviceInfo,
            unlockCode: null
          };

          await this.setAccountLock(acc, lockPayload);

          if (client) {
            try {
              await client.auth.updateUser({
                data: {
                  lock_status: "locked",
                  lock_data: lockPayload,
                  conflict_count: conflictCount
                }
              });
            } catch {}
          }

          broadcastGlobalRealtime("ACCOUNT_LOCKED_CONFLICT", {
            account: acc,
            lock: lockPayload
          });

          this.broadcastMessage({
            type: "ACCOUNT_LOCKED_CONFLICT",
            account: acc,
            lock: lockPayload
          });

          return {
            success: false,
            locked: true,
            justLocked: true,
            status: "locked",
            lock: lockPayload,
            message: "Phát hiện sự cố tranh chấp đăng nhập liên tục giữa 2 thiết bị! Tài khoản đã được tự động tạm khóa để bảo vệ an toàn."
          };
        }
      }

      // C. Lưu phiên hoạt động duy nhất mới của tài khoản
      const sessions = this.getAllSessions();
      sessions[acc] = {
        account: acc,
        sessionId: mySessionId,
        deviceInfo: myDeviceInfo,
        createdAt: now,
        lastActive: now,
        conflictCount: conflictCount,
        displayName: meta.display_name || userObj?.display_name || acc
      };
      this.saveAllSessions(sessions);

      try {
        localStorage.setItem(MY_SESSION_KEY, mySessionId);
        localStorage.setItem(MY_ACCOUNT_KEY, acc);
      } catch {}

      // Đồng bộ thông tin phiên lên máy chủ Supabase Auth để mọi thiết bị khác phát hiện ngay
      if (client) {
        try {
          await client.auth.updateUser({
            data: {
              active_session_id: mySessionId,
              active_device: myDeviceInfo,
              session_time: now,
              conflict_count: conflictCount,
              lock_status: "active"
            }
          });
        } catch (e) {
          console.warn("Lỗi sync phiên đăng nhập lên Supabase:", e);
        }
      }

      // Báo hiệu lập tức đá thiết bị trước đó qua Supabase Realtime WebSocket (<100ms)
      broadcastGlobalRealtime("SESSION_DISPLACED", {
        account: acc,
        newSessionId: mySessionId,
        newDeviceInfo: myDeviceInfo,
        time: now
      });

      this.broadcastMessage({
        type: "SESSION_DISPLACED",
        account: acc,
        newSessionId: mySessionId,
        newDeviceInfo: myDeviceInfo,
        time: now
      });

      return {
        success: true,
        sessionId: mySessionId,
        deviceInfo: myDeviceInfo
      };
    },

    // 3. Kiểm tra tính hợp lệ của phiên trên thiết bị hiện tại
    checkCurrentDeviceSession(account) {
      const acc = this.normalizeAccount(account || localStorage.getItem(MY_ACCOUNT_KEY));
      if (!acc) return { valid: true };

      // A. Kiểm tra tài khoản có bị khóa không
      const lock = this.getAccountLock(acc);
      if (lock && (lock.status === "locked" || lock.status === "unlock_pending")) {
        return {
          valid: false,
          locked: true,
          status: lock.status,
          lock: lock,
          reason: "locked"
        };
      }

      // B. Kiểm tra phiên hiện tại có khớp với phiên đang active của tài khoản không
      const mySessionId = localStorage.getItem(MY_SESSION_KEY);
      if (!mySessionId) return { valid: true };

      const sessions = this.getAllSessions();
      const currentActive = sessions[acc];

      if (!currentActive) return { valid: true };

      if (currentActive.sessionId && currentActive.sessionId !== mySessionId) {
        return {
          valid: false,
          displaced: true,
          newDevice: currentActive.deviceInfo || "Thiết bị khác",
          newTime: currentActive.createdAt,
          reason: "displaced"
        };
      }

      return { valid: true };
    },

    broadcastMessage(msg) {
      try {
        if (sessionBroadcastChannel) {
          sessionBroadcastChannel.postMessage(msg);
        }
      } catch {}
      try {
        localStorage.setItem("aicheck:session_event", JSON.stringify({
          ...msg,
          _timestamp: Date.now()
        }));
      } catch {}
    },

    // 4. Xác thực mã mở khóa do Admin gửi
    async verifyAndUnlock(account, enteredCode) {
      const acc = this.normalizeAccount(account);
      if (!acc) return { success: false, message: "Không tìm thấy thông tin tài khoản!" };

      let lock = this.getAccountLock(acc);
      if (!lock) {
        try { lock = await this.getAccountLockRemote(acc); } catch {}
      }

      if (!lock) {
        return { success: true, message: "Tài khoản hiện không bị khóa." };
      }

      if (lock.status !== "unlock_pending" || !lock.unlockCode) {
        return {
          success: false,
          message: "Tài khoản chưa được Quản trị viên cấp mã mở khóa. Vui lòng gửi biểu mẫu hỗ trợ và đợi Quản trị viên kiểm tra."
        };
      }

      const cleanInput = String(enteredCode || "").trim().toUpperCase();
      const cleanTarget = String(lock.unlockCode).trim().toUpperCase();

      if (cleanInput !== cleanTarget) {
        return {
          success: false,
          message: "Mã mở khóa không chính xác! Vui lòng kiểm tra lại mã đã được Quản trị viên gửi về email hoặc icon chuông 🔔."
        };
      }

      await this.clearAccountLock(acc);

      if (client) {
        try {
          await client.auth.updateUser({
            data: {
              lock_status: "cleared",
              conflict_count: 0,
              unlock_code: null
            }
          });
        } catch {}
      }

      broadcastGlobalRealtime("ACCOUNT_UNLOCKED", { account: acc });

      if (window.AICheckNotificationStore) {
        window.AICheckNotificationStore.sendNotification({
          recipient: acc,
          sender: "Hệ thống Bảo mật THĐ",
          type: "system",
          title: "🎉 Tài khoản đã được mở khóa thành công",
          message: `Chào bạn, tài khoản <strong>${acc}</strong> đã hoàn tất xác thực mã mở khóa và kích hoạt lại phiên làm việc an toàn.`
        });
      }

      return {
        success: true,
        message: "Mở khóa tài khoản thành công!"
      };
    },

    // 5. Admin duyệt thông tin và cấp mã mở khóa
    async grantUnlockCode(account, unlockCode) {
      const acc = this.normalizeAccount(account);
      if (!acc) return false;

      const code = String(unlockCode || Math.floor(100000 + Math.random() * 900000)).trim();
      let currentLock = this.getAccountLock(acc);
      if (!currentLock) {
        try { currentLock = await this.getAccountLockRemote(acc); } catch {}
      }

      const lockData = currentLock || {
        account: acc,
        lockedAt: Date.now()
      };

      lockData.status = "unlock_pending";
      lockData.unlockCode = code;
      lockData.unlockGrantedAt = Date.now();

      await this.setAccountLock(acc, lockData);

      // Cập nhật yêu cầu trong Cloud Shared Store sang resolved và đính kèm code
      try {
        await updateCloudSharedData(d => {
          if (d.support_requests) {
            d.support_requests.forEach(r => {
              if ((r.user_email || "").toLowerCase().trim() === acc) {
                r.status = "resolved";
                r.unlockCode = code;
              }
            });
          }
          return d;
        });
      } catch {}

      // Gửi thông báo đến icon chuông 🔔 của tài khoản
      if (window.AICheckNotificationStore) {
        window.AICheckNotificationStore.sendNotification({
          recipient: acc,
          sender: "Ban Quản trị THĐ (adminthd)",
          type: "account_unlock",
          title: "🔑 Mã mở khóa tài khoản sau sự cố tranh chấp thiết bị",
          message: `Chào bạn, Ban Quản trị THĐ đã xác minh biểu mẫu thông tin của bạn là <strong>CHÍNH XÁC</strong>.<br>Mã mở khóa tài khoản của bạn là: <div style="font-family:'Space Grotesk',monospace;font-size:18px;font-weight:800;letter-spacing:3px;color:#047857;background:#ecfdf5;border:1px solid #a7f3d0;padding:6px 14px;border-radius:6px;margin:8px 0;display:inline-block">${code}</div><br>👉 Bạn hãy quay lại trang Đăng nhập và nhập mã này để kích hoạt lại tài khoản.`,
          adminPin: code,
          link: `login.html?unlock_email=${encodeURIComponent(acc)}`
        });
      }

      // Phát sóng toàn cầu qua WebSocket
      broadcastGlobalRealtime("GRANT_UNLOCK_CODE", {
        account: acc,
        code: code,
        time: Date.now()
      });

      return true;
    }
  };

  window.AICheckSessionManager = AICheckSessionManager;

  window.AICheckCloud = {
    configured,
    client,
    getRealtimeChannel,
    CLOUD_SYNC_API_URL,
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
    getAllCloudSupportRequests,
    processSyncQueue,
    syncGamification,
    // Session & Device Conflict Manager
    sessionManager: AICheckSessionManager
  };
})();
