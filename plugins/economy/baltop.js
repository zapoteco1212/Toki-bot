
export default {
  command: ['economyboard','eboard','baltop'],
  run: async (sock, m, args) => {
    const chatId = m.key.remoteJid
    const db = global.db?.data || global.db
    if (!db?.chats?.[chatId]) {
      return sock.sendMessage(chatId, { text: '❌ No hay datos de este chat.' }, { quoted: m })
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = db.settings?.[botId]?.currency || 'Coins'
    const chatData = db.chats[chatId]

    try {
      const users = Object.entries(chatData.users || {})
       .filter(([_, data]) => ((data.coins || 0) + (data.bank || 0)) >= 1000)
       .map(([key, data]) => {
          const name = db.users?.[key]?.name || data.name || 'Usuario'
          return {...data, jid: key, name }
        })

      if (users.length === 0) {
        return sock.sendMessage(chatId, { text: `ꕥ No hay usuarios en el grupo con más de 1,000 ${monedas}.` }, { quoted: m })
      }

      const sorted = users.sort((a, b) => ((b.coins||0)+(b.bank||0)) - ((a.coins||0)+(a.bank||0)))
      const page = parseInt(args[0]) || 1
      const pageSize = 10
      const totalPages = Math.ceil(sorted.length / pageSize)

      if (isNaN(page) || page < 1 || page > totalPages) {
        return sock.sendMessage(chatId, { text: `《✧》 La página *${page}* no existe. Hay *${totalPages}* páginas.` }, { quoted: m })
      }

      const start = (page - 1) * pageSize
      const end = start + pageSize

      let text = `*✩ EconomyBoard (✿◡‿◡)*\n\n`
      text += sorted.slice(start, end).map(({ name, coins, bank }, i) => {
        const total = (coins || 0) + (bank || 0)
        return `✩ ${start + i + 1} › *${name}*\n Total → *¥${total.toLocaleString()} ${monedas}*`
      }).join('\n')

      text += `\n\n> ⌦ Página *${page}* de *${totalPages}*`
      if (page < totalPages) {
        text += `\n> Para ver la siguiente página › *.eboard ${page + 1}*`
      }

      await sock.sendMessage(chatId, { text }, { quoted: m })
    } catch (e) {
      await sock.sendMessage(chatId, { text: `> Error: ${e.message}` }, { quoted: m })
    }
  }
        }
