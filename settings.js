import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

const botOwner = ['5217551011162'] 

const mainOwners = [
'5217442573779', 
'5217441863414', 
]

const extraOwners = [
]

global.owner = [...botOwner, ...mainOwners, ...extraOwners]
global.botNumber = ''

global.sessionName = 'Sessions/Owner'
global.version = '^2.0 - Latest'
global.dev = "© тσki bot 𝚙𝚘𝚠𝚎𝚛𝚎𝚍 | werkito"
global.links = {
  api: 'https://api.evogb.org',
  channel: "https://whatsapp.com/channel/0029VaAN15BJP21BYCJ3tH04",
  github: "https://github.com/zapoteco1212",
  gmail: "werkitoyt@gmail.com"
}
global.my = {
  ch: '120363401404146384@newsletter',
  name: 'ೃ࿔ toki bot - σƒƒเ૮เαℓ ૮ɦαɳɳεℓ .ೃ࿐',
}

global.mess = {
  socket: '《✧》 Este comando solo puede ser ejecutado por un Socket.',
  admin: '《✧》 Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '《✧》 Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.'
}
global.APIs = {
  axi: { url: "https://apiaxi.i11.eu", key: null },
  vreden: { url: "https://api.vreden.web.id", key: null },
  nekolabs: { url: "https://api.nekolabs.web.id", key: null },
  siputzx: { url: "https://api.siputzx.my.id", key: null },
  delirius: { url: "https://api.delirius.store", key: null },
  ootaizumi: { url: "https://api.ootaizumi.web.id", key: null },
  stellar: { url: "https://api.yuki-wabot.my.id", key: "YukiBot-MD" },
  apifaa: { url: "https://api-faa.my.id", key: null },
  xyro: { url: "https://api.xyro.site", key: null },
  yupra: { url: "https://api.yupra.my.id", key: null },
  url: 'https://api.evogb.org',
  key: 'Weerkito'
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  import(`${file}?update=${Date.now()}`)
})
