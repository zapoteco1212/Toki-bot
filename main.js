import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
global.comandos = global.comandos || new Map()
export async function loadCommands() {
  const dir = path.join(__dirname, 'plugins')
  if(!fs.existsSync(dir)) fs.mkdirSync(dir)
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('.js'))
  global.comandos.clear()
  for(const file of files){
    try{
      const full = path.join(dir, file)
      const { default: cmd } = await import(`file://${full}?update=${Date.now()}`)
      if(cmd?.command) cmd.command.forEach(c=>global.comandos.set(c.toLowerCase(), cmd))
    }catch(e){ console.log(`❌ ${file}: ${e.message}`) }
  }
  console.log(`✅ ${global.comandos.size} comandos cargados`)
}
export default async function main(sock, m) {
  if(!m.message) return
  let body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || ""
  if(!body.startsWith('.')) return
  let args = body.trim().split(/ +/)
  let name = args.shift().slice(1).toLowerCase()
  let cmd = global.comandos.get(name)
  if(!cmd) return
  await cmd.run(sock, m, args)
}
