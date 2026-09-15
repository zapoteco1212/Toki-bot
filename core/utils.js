// core/utils.js

/**
 * Resuelve LID (nuevo formato de WhatsApp) a JID real
 */
export async function resolveLidToRealJid(jid, client, chatId) {
  try {
    if (!jid) return jid
    if (jid.includes('@s.whatsapp.net') &&!jid.includes('@lid')) return jid

    // Si es LID, intentar resolver
    if (jid.includes('@lid') || jid.includes(':')) {
      const store = client.signalRepository || client.authState?.creds
      // intento directo con Baileys
      if (client.onWhatsApp) {
        const check = await client.onWhatsApp(jid).catch(()=>null)
        if (check && check[0]?.jid) return check[0].jid
      }
      // si no se puede, devolver limpio
      return jid.split(':')[0] + '@s.whatsapp.net'
    }
    return jid
  } catch {
    return jid
  }
}

/**
 * Formatear tiempo bonito
 */
export function formatTime(ms) {
  if (ms <= 0) return 'Ahora.'
  let s = Math.floor(ms / 1000)
  let d = Math.floor(s / 86400); s %= 86400
  let h = Math.floor(s / 3600); s %= 3600
  let m = Math.floor(s / 60)
  s %= 60
  const parts = []
  if (d) parts.push(`${d}d`)
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  if (s) parts.push(`${s}s`)
  return parts.join(', ') || 'Ahora.'
}

/**
 * Random
 */
export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Es admin?
 */
export async function isAdmin(client, chatId, jid) {
  try {
    const meta = await client.groupMetadata(chatId)
    return meta.participants.some(p => p.id === jid && (p.admin === 'admin' || p.admin === 'superadmin'))
  } catch { return false }
}

/**
 * Es owner?
 */
export function isOwner(jid) {
  const owners = global.owner || []
  return owners.some(n => jid.includes(n))
  }
