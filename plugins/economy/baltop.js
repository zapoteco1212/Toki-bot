import { resolveLidToRealJid } from "../../core/utils.js"

export default {
  command: ['economyboard', 'eboard', 'baltop', 'topbal', 'top', 'topcoins'],
  category: 'economia',
  run: async (client, m, args, usedPrefix, command) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId] || {}
    const monedas = botSettings.currency || "Toki Coins"
    const chatData = db.chats[chatId]

    if (chatData?.adminonly ||!chatData?.economy) return m.reply(
      `╭─〔 ✿ Toki Bot 〕─╮\n│ Economía desactivada.\n│ Actívala con:\n│ » *${usedPrefix}economy on*\n╰─╯`
    )

    try {
      const rawUsers = chatData.users || {}
      const users = Object.entries(rawUsers).map(([jid, data]) => {
          const total = (data.coins || 0) + (data.bank || 0)
          if (total < 500) return null
          const name = db.users?.[jid]?.name || data.name || jid.split('@')[0]
          return { jid, name, coins: data.coins || 0, bank: data.bank || 0, total }
        }).filter(Boolean)

      if (users.length === 0) return m.reply(`《✿》 Nadie tiene más de 500 ${monedas} aún en este grupo.`)

      const sorted = users.sort((a, b) => b.total - a.total)
      const page = parseInt(args[0]) || 1
      const pageSize = 10
      const totalPages = Math.ceil(sorted.length / pageSize)

      if (isNaN(page) || page < 1 || page > totalPages) {
        return m.reply(`《✿》 La página *${page}* no existe. Hay *${totalPages}* páginas disponibles.`)
      }

      const start = (page - 1) * pageSize
      const medals = ['🥇', '🥈', '🥉']

      let text = `╭─〔 ✿ 𝗧𝗢𝗞𝗜 - 𝗧𝗢𝗣 𝗠𝗜𝗟𝗢𝗡𝗔𝗥𝗜𝗢𝗦 ✿ 〕─╮\n`
      text += `│\n`
      text += `│ 💰 Moneda: *${monedas}*\n`
      text += `│ 👥 Usuarios: *${sorted.length}*\n`
      text += `│\n`
      text += `│ ── TOP ${start + 1} al ${Math.min(start + pageSize, sorted.length)} ──\n`
      text += `│\n`

      sorted.slice(start, start + pageSize).forEach((u, i) => {
        const pos = start + i
        const medal = medals[pos] || `✿ ${pos + 1}.`
        text += `│ ${medal} *${u.name}*\n`
        text += `│ ⛀ ${u.coins.toLocaleString()} | ⚿ ${u.bank.toLocaleString()} | ⛁ *${u.total.toLocaleString()}*\n`
        text += `│\n`
      })

      text += `│ ━━━━━━━━━━━━━━━\n`
      text += `│ 📄 Página *${page}* de *${totalPages}*\n`
      if (page < totalPages) {
        text += `│ ➡️ Siguiente: *${usedPrefix + command} ${page + 1}*\n`
      }
      text += `│\n`
      text += `╰─〔 🐾 Toki Bot - Economy 〕─╯`

      const mentions = sorted.slice(start, start + pageSize).map(u => u.jid).slice(0, 5)
      await client.sendMessage(chatId, { text, mentions }, { quoted: m })

    } catch (e) {
      console.log(e)
      await m.reply(`《✿》 Error en ${usedPrefix + command}: ${e.message}`)
    }
  }
                  }
