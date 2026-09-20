let isNumber = (x) => typeof x === 'number' && !isNaN(x)

function initDB(m, client) {
  const jid = client.user.id.split(':')[0] + '@s.whatsapp.net'

  const settings = global.db.data.settings[jid] ||= {}
  settings.self ??= false
  settings.prefix ??= ['/', '!', '.', '#']
  settings.commandsejecut ??= isNumber(settings.commandsejecut) ? settings.commandsejecut : 0
  
  settings.id ??= '120363198641161536@newsletter'
  
  // 🔥 OPCIÓN 1 (Cursiva elegante y segura):
  settings.nameid ??= "'ೃ࿔ toki bot- oficial channel ೃ࿐"
  
  // Si prefieres la Opción 2 (Letras dobles), borra la de arriba y usa esta:
  // settings.nameid ??= "'ೃ࿔ 𝕋𝕠ki bot - 𝕆𝕗𝕗𝕚𝕔𝕚𝕒𝕝 ℂ𝕙𝕒𝕟𝕟𝕖𝕝 ೃ࿐"

  settings.type ??= 'Owner'
  // 🔥 Corregido: Quité el punto final que rompía el link
  settings.link ??= 'https://api.evogb.org' 
  settings.banner ??= 'https://cdn.evogb.org/Werkito/HqIEk-1776246505896__1_.png'
  settings.icon ??= 'https://cdn.evogb.org/Werkito/4IRJ3-492b353378d674382c0649df1260571c.jpg'
  settings.currency ??= 'Yenes'
  settings.namebot ??= 'Toki'
  settings.botname ??= 'Toki bot'  
  settings.owner ??= ''

  const user = global.db.data.users[m.sender] ||= {}
  user.name ??= m.pushName
  user.exp = isNumber(user.exp) ? user.exp : 0
  user.level = isNumber(user.level) ? user.level : 0
  user.usedcommands = isNumber(user.usedcommands) ? user.usedcommands : 0
  user.pasatiempo ??= ''
  user.description ??= ''
  user.marry ??= ''
  user.genre ??= ''
  user.birth ??= ''
  user.metadatos ??= null
  user.metadatos2 ??= null

  const chat = global.db.data.chats[m.chat] ||= {}
  chat.users ||= {}
  chat.isBanned ??= false
  chat.welcome ??= false
  chat.goodbye ??= false
  chat.sWelcome ??= ''
  chat.sGoodbye ??= ''
  chat.nsfw ??= false
  chat.alerts ??= false
  chat.gacha ??= true
  chat.economy ??= true
  chat.adminonly ??= false
  chat.primaryBot ??= null
  chat.antilinks ??= true

  chat.users[m.sender] ||= {}
  chat.users[m.sender].stats ||= {}
  chat.users[m.sender].usedTime ??= null
  chat.users[m.sender].lastCmd = isNumber(chat.users[m.sender].lastCmd) ? chat.users[m.sender].lastCmd : 0
  chat.users[m.sender].coins = isNumber(chat.users[m.sender].coins) ? chat.users[m.sender].coins : 0
  chat.users[m.sender].bank = isNumber(chat.users[m.sender].bank) ? chat.users[m.sender].bank : 0
  chat.users[m.sender].afk = isNumber(chat.users[m.sender].afk) ? chat.users[m.sender].afk : -1
  chat.users[m.sender].afkReason ??= ''
  chat.users[m.sender].characters = Array.isArray(chat.users[m.sender].characters) ? chat.users[m.sender].characters : []
}

export default initDB;
