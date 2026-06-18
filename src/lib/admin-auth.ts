/**
 * Autenticação simples do painel (um operador).
 *
 * Local/dev: senha padrão "bellus". Em produção, defina ADMIN_PASSWORD e
 * ADMIN_TOKEN no ambiente. Para múltiplos usuários, troque por Supabase Auth.
 */
export const ADMIN_COOKIE = 'bellus_admin'
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bellus'
/** Valor gravado no cookie quando a senha confere. Mantenha secreto em produção. */
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-bellus-token'
