import { resolveLidToRealJid } from "../../core/utils.js"

export default {
  command: ['economyboard', 'eboard', 'baltop', 'topbal', 'top'],
  category: 'economia',
  run: async (client, m, args, usedPrefix, command) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const monedas = botSettings?.currency || "Toki Coins"
    const chatData = db.chats[chatId]

    if (chatData?.adminonly ||!chatData?.economy) return m.reply(
      `╭─〔 ✿ Toki Bot 〕─╮\n│ Economía desactivada.\n│ Actívala con:\n│ » *${usedPrefix}economy on*\n╰─╯`
    )

    try {
      const users = Object.entries(chatData.users || {}).filter(([_, data]) => {
          const total = (data.coins || 0) + (data.bank || 0)
          return total >= 1000
        }).map(([key, data]) => {
          const name = db.users[key]?.name || data.name || 'Usuario'
          return {...data, jid: key, name }
        })

      if (users.length === 0) return m.reply(`《✿》 Nadie tiene más de 1,000 ${monedas} aún.`)

      const sorted = users.sort((a, b) => (b.coins || 0) + (b.bank || 0) - ((a.coins || 0) + (a.bank || 0)))
      const page = parseInt(args[0]) || 1
      const pageSize = 10
      const totalPages = Math.ceil(sorted.length / pageSize)

      if (isNaN(page) || page < 1 || page > totalPages) return m.reply(`《✿》 Página *${page}* no existe. Hay *${totalPages}* páginas.`)

      const start = (page - 1) * pageSize
      const end = start + pageSize

      let text = `╭─〔 ✿ 𝗧𝗢𝗞𝗜 - 𝗧𝗢𝗣 𝗕𝗔𝗟 ✿ 〕─╮\n│\n`
      text += sorted.slice(start, end).map(({ name, coins, bank }, i) => {
          const total = (coins || 0) + (bank || 0)
          return `│ ✿ ${start + i + 1} › *${name}*\n│ → ¥${total.toLocaleString()} ${monedas}`
        }).join('\n')

      text += `\n│\n│ > Página *${page}* de *${totalPages}*`
      if (page < totalPages) text += `\n│ > Siguiente › *${usedPrefix + command} ${page + 1}*`
      text += `\n│\n╰─〔 🐾 Toki Bot 〕─╯`

      await client.sendMessage(chatId, { text }, { quoted: m })
    } catch (e) {
      await m.reply(`《✿》 Error en ${usedPrefix + command}: ${e.message}`)
    }
  }
      }
