export default {
  command: ['addcoins'],
  help: ['addcoins @user <cantidad>'],
  tags: ['owner'],
  run: async (client, m, args) => {
    const OWNERS = ["5217442573779","114414455943397","5217441863414"]
    let jid = m.sender || m.key?.participant || ''
    let clean = jid.split('@')[0].replace(/\D/g,'')
    if (!OWNERS.some(n => clean.endsWith(n.slice(-10)))) {
      return await client.sendMessage(m.chat, { text: '❌ Solo Owner' }, { quoted: m })
    }

    let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      || m.message?.extendedTextMessage?.contextInfo?.participant
      || (m.quoted? m.quoted.sender : null)

    if (!target) {
      // si es respuesta o si pone numero
      let num = args[0]?.replace(/[^0-9]/g,'')
      if (num && args[1]) {
        target = num + '@s.whatsapp.net'
        args.shift()
      } else if (m.quoted) {
        target = m.quoted.sender
      } else {
        return await client.sendMessage(m.chat, { text: '✳️ Uso:.addcoins @user 100\nO responde a un mensaje:.addcoins 100' }, { quoted: m })
      }
    }

    let cantidad = parseInt(args[0] || args[1] || args[args.length-1])
    if (!cantidad || isNaN(cantidad)) return await client.sendMessage(m.chat, { text: '❌ Pon la cantidad. Ej:.addcoins @user 500' }, { quoted: m })

    // --- DB ---
    if (!global.db) global.db = { data: { users: {} } }
    if (!global.db.data) global.db.data = { users: {} }
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[target]) global.db.data.users[target] = { coins: 0, money: 0, exp: 0 }

    let user = global.db.data.users[target]
    if (user.coins == null) user.coins = 0
    user.coins += cantidad
    if (user.money!= null) user.money += cantidad

    if (global.db.write) await global.db.write().catch(()=>{})

    await client.sendMessage(m.chat, { text: `✅ *COINS AÑADIDOS*\n\n👤 Usuario: @${target.split('@')[0]}\n💰 Cantidad: +${cantidad}\n💳 Total: ${user.coins}`, mentions: [target] }, { quoted: m })
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(()=>{})
  }
      }
