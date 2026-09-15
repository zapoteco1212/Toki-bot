import { jidDecode } from "@whiskeysockets/baileys"
export async function smsg(sock, m) {
  if (!m) return m
  m.chat = m.key.remoteJid
  m.sender = m.key.participant || m.key.remoteJid
  m.isGroup = m.chat.endsWith('@g.us')
  m.reply = (text) => sock.sendMessage(m.chat, { text }, { quoted: m })
  m.react = (emoji) => sock.sendMessage(m.chat, { react: { text: emoji, key: m.key } })
  return m
}
export default smsg
