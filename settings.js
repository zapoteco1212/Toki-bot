import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

const botOwner = ['5217442573779'] 

const mainOwners = [
  '', // Owner 1
  '', // Owner 2
  '', // Owner 3
]

const extraOwners = [
  '', // Extra 1
  '', // Extra 2
  '', // Extra 3
]

global.owner = [...botOwner, ...mainOwners, ...extraOwners]
global.botNumber = ''

global.sessionName = 'Sessions/Toki'
global.version = 'Toki Bot - v1.0'
global.dev = "© Toki Bot | Powered by Toki"
global.botName = "✿ Toki Bot ✿"

global.links = {
  channel: "",
  github: "",
  gmail: ""
}

global.my = {
  ch: '120363000000000000@newsletter',
  name: '✿ Toki Bot - Official Channel ✿',
}

global.mess = {
  owner: '《✿》 Este comando es solo para mis owners.',
  admin: '《✿》 Este comando solo es para admins del grupo.',
  botAdmin: '《✿》 Necesito ser admin para hacer eso.',
  group: '《✿》 Solo se puede usar en grupos.',
  private: '《✿》 Solo se puede usar en privado.',
}

global.APIs = {
  stellar: { url: "https://api.yuki-wabot.my.id", key: "YukiBot-MD" },
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log('✿ settings.js actualizado')
  import(`${file}?update=${Date.now()}`)
})
