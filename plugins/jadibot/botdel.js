import fs from 'fs'
export default {
  command: ['delbot','delsubbot','delserbot'],
  category: 'socket',
  run: async (client, m, args) => {
    let who = args[0]? args[0].replace(/[^0-9]/g,'') : m.sender.split('@')[0]
    let authFolder = `./auth-subbots/${who}`
    if (!fs.existsSync(authFolder)) return m.reply(`✿ No existe subbot ${who}`)

    fs.rmSync(authFolder, { recursive: true, force: true })
    let i = global.subBots?.findIndex(v => v.id === who)
    if (i!== -1) {
      try { global.subBots[i].sock.ws.close() } catch {}
      global.subBots.splice(i,1)
    }
    m.reply(`╭─〔 ✿ SubBot Borrado 〕─╮\n│ ID: ${who}\n╰─╯`)
  }
}
