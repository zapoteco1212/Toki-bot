import fs from 'fs'

const DB = './database.json'
const loadDB = () => { if(!fs.existsSync(DB)) fs.writeFileSync(DB,'{}'); return JSON.parse(fs.readFileSync(DB)) }

export default {
  command: ['economyboard', 'eboard', 'baltop'],
  run: async (client, m, args) => {
    const db = loadDB()
    const monedas = 'Coins'

    const users = Object.entries(db).filter(([_, data]) => {
      const total = (data.coins || 0) + (data.bank || 0)
      return total >= 1000
    }).map(([key, data]) => {
      return {...data, jid: key, name: data.name || key.split('@')[0] }
    })

    if (users.length === 0) return client.sendMessage(m.chat, { text: `ꕥ No hay usuarios con más de 1,000 ${monedas}.` }, { quoted: m })

    const sorted = users.sort((a, b) => (b.coins + b.bank) - (a.coins + a.bank))
    const page = parseInt(args[0]) || 1
    const pageSize = 10
    const totalPages = Math.ceil(sorted.length / pageSize)

    if (isNaN(page) || page < 1 || page > totalPages) return client.sendMessage(m.chat, { text: `《✧》 La página *${page}* no existe. Hay *${totalPages}* páginas.` }, { quoted: m })

    const start = (page - 1) * pageSize
    const end = start + pageSize

    let text = `*✩ EconomyBoard (✿◡‿◡)*\n\n`
    text += sorted.slice(start, end).map(({ name, coins, bank }, i) => {
      const total = (coins || 0) + (bank || 0)
      return `✩ ${start + i + 1} › *${name}*\n Total → *¥${total.toLocaleString()} ${monedas}*`
    }).join('\n')

    text += `\n\n> ⌦ Página *${page}* de *${totalPages}*`
    if (page < totalPages)
      text += `\n> Para ver la siguiente página › *.baltop ${page + 1}*`

    await client.sendMessage(m.chat, { text }, { quoted: m })
  }
}
