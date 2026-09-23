import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
const execAsync = promisify(exec)

export default {
  command: ['fix', 'actualizar', 'update', 'sync'],
  category: 'owner',
  run: async (client, m) => {
    if (!global.owner?.includes(m.sender.split('@')[0]) &&!m.fromMe) {
      return client.sendMessage(m.chat, { text: '❌ *Solo Owner puede usar esto*' }, { quoted: m })
    }

    const editor = m.pushName || 'Owner'
    let msg = await client.sendMessage(m.chat, { text: `╭─❀ *S I N C R O N I Z A N D O* ❀\n│\n│ ⏳ Bajando actualización de GitHub...\n╰─>` }, { quoted: m })

    try {
      
      await execAsync('git fetch origin && git reset --hard origin/main && git pull origin main --force')

      
      let filesOutput = ''
      try {
        const { stdout } = await execAsync('git log -1 --name-only --pretty=format:')
        filesOutput = stdout
      } catch {}

      
      if (filesOutput.includes('package.json')) {
        await client.sendMessage(m.chat, { text: '📦 `package.json` detectado, instalando y parchando...', edit: msg.key })

        await execAsync('npm install --legacy-peer-deps --silent')

        
        const isTermux = fs.existsSync('/data/data/com.termux')
        const libPath = './node_modules/@skidy89/libsignal-plugins'
        const releaseSo = path.join(libPath, 'target/release')

        
        if (isTermux) {
          try {
          
            if (fs.existsSync(`${process.env.HOME}/libsignal-plugins/target/release`)) {
              const soFile = fs.readdirSync(`${process.env.HOME}/libsignal-plugins/target/release`).find(f => f.endsWith('.so'))
              if (soFile) {
                const srcSo = `${process.env.HOME}/libsignal-plugins/target/release/${soFile}`
                const dest1 = path.join(libPath, 'libsignal-plugins.android-arm64.node')
                const dest2 = path.join(libPath, 'libsignal-plugins.linux-arm64-gnu.node')
                if (fs.existsSync(libPath)) {
                  fs.copyFileSync(srcSo, dest1)
                  fs.copyFileSync(srcSo, dest2)
                }
              }
            } else if (fs.existsSync(releaseSo)) {
              
              const soFile = fs.readdirSync(releaseSo).find(f => f.endsWith('.so'))
              if (soFile) {
                fs.copyFileSync(path.join(releaseSo, soFile), path.join(libPath, 'libsignal-plugins.android-arm64.node'))
                fs.copyFileSync(path.join(releaseSo, soFile), path.join(libPath, 'libsignal-plugins.linux-arm64-gnu.node'))
              }
            }
          } catch (e) {
            console.log('Error parche libsignal:', e.message)
          }
        }
      }

      
      try {
        const { loadCommands } = await import('../main.js?update=' + Date.now())
        if (loadCommands) await loadCommands()
      } catch {}

      let archivos = filesOutput? filesOutput.trim().split('\n').filter(f => f && f.trim()) : []
      let total = archivos.length || 0
      let detalle = total > 0
       ? archivos.slice(0, 15).map(f => `│ • \`${f.trim()}\``).join('\n')
        : '│ • `Actualización general / fix menor`'

      if (total > 15) detalle += `\n│ • _... y ${total - 15} más_`

      let commit = 'Sin info'
      try {
        const { stdout } = await execAsync('git log -1 --pretty=format:"%h | %s"')
        commit = stdout.trim()
      } catch {}

      let texto = `╭─❀ *A C T U A L I Z A C I Ó N E X I T O S A* ❀
│
│ ✦ *Editor:* ${editor}
│ ✦ *Commit:* ${commit}
│ ✦ *Total Cambios:* ${total || 1} archivo(s)
│
│ ✦ *Detalles:*
${detalle}
│
╰─> *Bot sincronizado con GitHub* ✅`

      await client.sendMessage(m.chat, { text: texto, edit: msg.key })

    } catch (e) {
      await client.sendMessage(m.chat, {
        text: `╭─❌ *ERROR EN UPDATE*\n│\n│ ${e.message.slice(0, 800)}\n╰─> Revisa tu consola`,
        edit: msg?.key
      }, { quoted: m })
    }
  }
          }
