/**
 * ╭─❀ T O K I - B O T - O W N E R S P R O ❀
 * Aquí van TODOS los owners, soporta número y LID
 * Formato: [ID, Nombre, true]
 * true = Owner real con todos los permisos
 */

global.owner = [
  // --- OWNERS CON NÚMERO ---
  ["5217442573779", "Toki - Principal", true],
  ["5217441863414", "Owner 2", true],
  ["5213121447080", "Owner 3", true],

  // --- OWNERS CON LID (114...) - IMPORTANTE PARA QUE NO TE DIGA "No eres owner" ---
  ["114414455943397", "Guayalo - LID", true],
  // Agrega aquí el LID de tus otros owners
  // ["123456789012345", "Amigo LID", true],

  // --- PUEDES AGREGAR MÁS AQUÍ ABAJO ---
  // ["5210000000000", "Nuevo Owner", true],
]

// Config del bot
global.botNumber = "5217442573779"
global.pairingNumber = "5217442573779"
global.sessionName = "./Sessions/Owner"
global.botname = "Toki-bot"
global.db = { data: { settings: {}, chats: {}, users: {}, owners: {} } }
global.loadDatabase = async () => {}
global.conns = []

// --- SISTEMA ANTI-LID: detecta owner aunque WhatsApp mande 114... o 521 o 52 ---
global.isOwner = (jid) => {
  if (!jid) return false
  try {
    let id = jid.split('@')[0]
    let last10 = id.slice(-10)
    for (let o of global.owner) {
      let num = Array.isArray(o)? o[0] : o
      if (!num) continue
      let n = String(num)
      if (id === n) return true // LID exacto
      if (n.slice(-10) === last10) return true // 521 vs 52
      if (id.includes(n) || n.includes(id)) return true
    }
    return false
  } catch { return false }
}
