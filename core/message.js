import { jidNormalizedUser, getContentType } from '@whiskeysockets/baileys'

export function smsg(conn, m, store) {
  if (!m) return m
  let M = m
  if (M.key) {
    M.id = M.key.id
    M.chat = M.key.remoteJid
    M.fromMe = M.key.fromMe
    M.isGroup = M.chat?.endsWith('@g.us')
    M.sender = jidNormalizedUser(M.key.participant || M.key.remoteJid || '')
    if (M.isGroup) M.participant = M.sender
  }
  if (M.message) {
    M.mtype = getContentType(M.message)
    M.msg = M.message[M.mtype]
    M.body = M.message.conversation || M.msg?.caption || M.msg?.text || M.msg?.contentText || M.msg?.extendedTextMessage?.text || M.msg?.conversation || ''
    M.text = M.body
  }
  M.reply = (text, chatId = M.chat, options = {}) => conn.sendMessage(chatId, { text }, { quoted: M, ...options })
  return M
}
