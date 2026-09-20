
import fs from 'fs'

function getUsers() {
  if (global.db?.data?.users) return global.db.data.users
  if (global.db?.users) return global.db.users
  if (global.DATABASE?.data?.users) return global.DATABASE.data.users
  for (const p of ['./database.json','./core/database.json','./lib/database.json']) {
    try {
      if (fs.existsSync(p)) {
        const j = JSON.parse(fs.readFileSync(p,'utf8'))
        if (j.users) return j.users
        if (j.data?.users) return j.data.users
      }
    } catch {}
  }
  return {}
}

export default {
  command: ['baltop','topbal','balancetop','topdinero'],
  run: async (sock, m, args) => {
    const chatId = m.key.remoteJid
    const users = getUsers()
    const list = Object.entries(users)

    if (!list.length) {
      return sock.sendMessage(chatId, { text: '❌ No hay usuarios.' }, { quoted: m })
    }

    const sorted = list.map(([jid, data]) => {
      const money = data.money || data.coin || data.dinero || 0
      const bank = data.bank || data.banco || 0
      const total = Number(money) + Number(bank)
      const name = data.name || jid.split('@')[0]
      return { name, money, bank, total }
    }).sort((a,b) => b.total - a.total).slice(0, 10)

    let text = `💰 *BALANCE TOP*\n\n`
    sorted.forEach((u, i) => {
      let med = ['🥇','🥈','🥉'][i] || `${i+1}.`
      text += `${med} ${u.name}\n • Efectivo: ${u.money}\n • Banco: ${u.bank} | Total: ${u.total}\n\n`
    })

    await sock.sendMessage(chatId, { text: text.trim() }, { quoted: m })
  }
      }
