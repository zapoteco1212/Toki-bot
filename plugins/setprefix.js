import fs from 'fs'

const SETTINGS = './settings.json'
const loadSettings = () => {
  if(!fs.existsSync(SETTINGS)) fs.writeFileSync(SETTINGS, JSON.stringify({ prefix: ["."] }, null, 2))
  return JSON.parse(fs.readFileSync(SETTINGS))
}
const saveSettings = (s) => fs.writeFileSync(SETTINGS, JSON.stringify(s, null, 2))

export default {
  command: ['setprefix', 'setbotprefix', 'prefix'],
  run: async (client, m, args) => {
    // solo owner
    const ownerNumbers = global.owner || []
    const isOwner = ownerNumbers.some(n => m.sender.includes(n))
    if(!isOwner) return client.sendMessage(m.chat, { text: `❌ Solo mi owner puede cambiar el prefijo` }, { quoted: m })

    const settings = loadSettings()
    const defaultPrefix = [".", "#", "/", "!"]
    const value = args.join(' ').trim()

    if (!value) {
      const lista = Array.isArray(settings.prefix) ? settings.prefix.map(p=>`\`${p}\``).join(', ') : `\`${settings.prefix}\``
      return client.sendMessage(m.chat, { text:
`❀ Elige el modo de prefijo:

> ○ Only-Prefix » .setprefix .
> ○ Multi-Prefix » .setprefix !/.# 
> ○ No-Prefix » .setprefix noprefix
> ○ Reset » .setprefix reset

ꕥ Actualmente: ${lista}` }, { quoted: m })
    }

    if (value.toLowerCase() === 'reset') {
      settings.prefix = defaultPrefix
      saveSettings(settings)
      return client.sendMessage(m.chat, { text: `❀ Prefijos restaurados: *${defaultPrefix.join(' ')}*` }, { quoted: m })
    }

    if (value.toLowerCase() === 'noprefix') {
      settings.prefix = []
      saveSettings(settings)
      return client.sendMessage(m.chat, { text: `❀ Modo sin prefijos activado\n> Ahora responde sin prefijo` }, { quoted: m })
    }

    // detectar prefijos
    let lista = [...new Set(value.split(''))].filter(c => !/[a-zA-Z0-9\s]/.test(c))
    if (lista.length === 0) return client.sendMessage(m.chat, { text: `ꕥ No detecté prefijos válidos. Usa símbolos como . ! / #` }, { quoted: m })
    if (lista.length > 6) return client.sendMessage(m.chat, { text: `ꕥ Máximo 6 prefijos` }, { quoted: m })

    settings.prefix = lista
    saveSettings(settings)

    await client.sendMessage(m.chat, { text: `❀ Prefijo cambiado a *${lista.join(' ')}* correctamente.\n\n⚠️ Haz .fix y reinicia el bot para aplicar` }, { quoted: m })
  }
      }
