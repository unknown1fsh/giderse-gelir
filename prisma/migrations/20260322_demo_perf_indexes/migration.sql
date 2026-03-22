-- Demo performans index'leri
-- user_session: createDemoSession'daki updateMany için (userId + isActive filtresi)
CREATE INDEX IF NOT EXISTS "user_session_user_id_is_active_idx"
  ON "user_session"("user_id", "is_active");

-- user: demo user lookup için (role + isActive filtresi)
CREATE INDEX IF NOT EXISTS "user_role_is_active_idx"
  ON "user"("role", "is_active");
