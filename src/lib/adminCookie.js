// Constantes compartilhadas entre Edge (middleware.js) e Node (adminAuth.js).
// Não importa node:crypto aqui — middleware Edge não suporta.
export const ADMIN_COOKIE_NAME = 'admin_session'
