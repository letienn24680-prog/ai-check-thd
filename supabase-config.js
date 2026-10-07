window.AICHECK_CONFIG = {
  supabaseUrl: "https://pyxmhccvfysjtlxkdryr.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eG1oY2N2ZnlzanRseGtkcnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5OTUwOTAsImV4cCI6MjEwNjU3MTA5MH0.XOKxbICA77S9ATxIa-h_Se_Gh_vF5kg1910PvUWXX7A",
  googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSe-9XkwWqI1ObQ-u-FT-DvFFzbUE2sjyr-XgI9j1rChLuCNKA/viewform?usp=dialog",
  infographicUrl: "",
  videoUrl: ""
};

// Giữ nguyên window.supabase làm SDK gốc để cloud.js dùng sdk.createClient
if (typeof supabase !== 'undefined') {
  if (!window.supabaseClient) {
    window.supabaseClient = supabase.createClient(
      window.AICHECK_CONFIG.supabaseUrl, 
      window.AICHECK_CONFIG.supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
  }
  // KHÔNG gán window.supabase = window.supabaseClient nữa!
}