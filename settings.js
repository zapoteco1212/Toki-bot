// ╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
// ┃ ✦ T O K I - O W N E R S P R O ┃
// ┃ Soporta NUMERO y LID 114... ┃
// ╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

global.owner = [
  // FORMATO: [ID, Nombre, true]
  // true = tiene todos los permisos

  // --- TU NUMERO Y TU LID (LOS 2) ---
  ["5217442573779", "Zapoteco Principal", true],
  ["114414455943397", "Zapoteco LID", true], // <- ESTE ES EL QUE TE FALTABA

  // --- TUS OTROS OWNERS ---
  ["5216561814016", "Gael ", true],
  
  // Si tu Owner 2 y 3 también tienen LID, agregalos:
  // ["114xxxxxxxxxxxx", "Owner 2 LID", true],
  // ["114xxxxxxxxxxxx", "Owner 3 LID", true],

  // --- AGREGA MÁS AQUÍ ABAJO ---
  // ["521000000000", "Nombre", true],
  // ["114000000000", "Nombre LID", true],
]

global.botNumber = global.owner[0][0]
global.pairingNumber = global.owner[0][0]
global.sessionName = "./Sessions/Owner"
global.botname = "Toki-bot"
global.db = { data: { settings: {}, chats: {}, users: {} } }
global.loadDatabase = async () => {}
global.conns = []

// ESTA FUNCIÓN HACE QUE SIRVA CON NUMERO Y CON LID
global.isOwner = (jid) => {
  if (!jid) return false
  let id = jid.split('@')[0]
  let last10 = id.slice(-10)
  for (let o of global.owner) {
    let num = Array.isArray(o)? o[0] : o
    if (!num) continue
    num = String(num)
    if (id === num) return true
    if (num.slice(-10) === last10) return true
  }
  return false
}
