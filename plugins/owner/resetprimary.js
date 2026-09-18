
export default {
  command: ['resetprimary', 'delprimary'],
  category: 'owner',
  isOwner: true,
  run: async (client, m) => {
    const db = global.db.data
    const chats = db.chats
    let count = 0

    const chatIds = Object.keys(chats).filter(id => id.endsWith('@g.us'))

    if (chatIds.length === 0) {
      return m.reply('❌ No hay grupos registrados en la base de datos.')
    }

    chatIds.forEach(id => {
      if (chats[id].primaryBot) {
        delete chats[id].primaryBot
        count++
      }
    })

    await m.reply(`*Limpieza Global Completada*\n\nSe ha eliminado el Bot Primario en *${count}* grupos. Ahora todos los SubBots responderán libremente en esos chats.`)
  }
              }
