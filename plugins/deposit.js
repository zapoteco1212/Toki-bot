import fs from 'fs'

const DB = './database.json'
const loadDB = () => { if(!fs.existsSync(DB)) fs.writeFileSync(DB,'{}'); return JSON.parse(fs.readFileSync(DB)) }
const saveDB = (d) => fs.writeFileSync(DB, JSON.stringify(d, null, 2))

export default {
  command: ['dep', 'deposit', 'd'],
  run: async (client, m, args) => {
    const db = loadDB()
    const monedas = 'Coins'

    if(!db[m.sender]) db[m.sender] = { coins: 0, bank: 0, name: m.pushName }
    const user = db[m.sender]

    if (!args[0]) {
      return client.sendMessage(m.chat, { text: `《✧》 Ingresa la cantidad de *${monedas}* que quieras *depositar*.\n\nEj: *.dep 500* o *.dep all*` }, { quoted: m })
    }

    if (args[0].toLowerCase() === 'all') {
      if (user.coins <= 0) return client.sendMessage(m.chat, { text: `✎ No tienes *${monedas}* para depositar en tu *banco*` }, { quoted: m })
      const count = user.coins
      user.coins = 0
      user.bank += count
      saveDB(db)
      return client.sendMessage(m.chat, { text: `ꕥ Has depositado *¥${count.toLocaleString()} ${monedas}* en tu Banco` }, { quoted: m })
    }

    const count = parseInt(args[0])
    if (!count || count < 1) {
      return client.sendMessage(m.chat, { text: '✎ Ingresa una cantidad *válida* para depositar' }, { quoted: m })
    }

    if (user.coins <= 0 || user.coins < count) {
      return client.sendMessage(m.chat, { text: `❀ No tienes suficientes *${monedas}* para depositar` }, { quoted: m })
    }

    user.coins -= count
    user.bank += count
    saveDB(db)

    await client.sendMessage(m.chat, { text: `ꕥ Has depositado *¥${count.toLocaleString()} ${monedas}* en tu Banco` }, { quoted: m })
  }
        }
