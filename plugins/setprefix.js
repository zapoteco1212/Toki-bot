import fs from 'fs'

const SETTINGS = './settings.json'

const loadSettings = () => {
  if (!fs.existsSync(SETTINGS)) {
    fs.writeFileSync(SETTINGS, JSON.stringify({ prefix: ["."] }, null, 2))
  }
  return JSON.parse(fs.readFileSync(SETTINGS))
}

const saveSettings = (s) => {
  fs.writeFileSync(SETTINGS, JSON.stringify(s, null, 2))
  
  try {
    global.prefix = s.prefix
    if (global.db?.data?.settings) {
      const botId = Object.keys(global.db.data.settings)[0]
      if (botId) global.db.data.settings[botId].prefix = s.prefix
    }
  } catch {}
}

export default {
  command: ['setprefix', 'setbotprefix', 'prefix', 'prefijo'],
  help: ['setprefix'],
  tags: ['info'],
  desc: 'Cambiar los prefijos del bot.',

  run: async (client, m, args) => {
    const settings = loadSettings()
    const defaultPrefix = [".", "#", "/", "!"]
    const value = args.join(' ').trim()

    const current = Array.isArray(settings.prefix) && settings.prefix.length
     ? settings.prefix.map(p => `\`${p}\``).join(', ')
      : '`sin prefijos (noprefix)`'

    if (!value) {
      return client.sendMessage(m.chat, {
        text: `⌗°娲°₊ *— SetPrefix Toki-Bot* ✿\n\n─────────────────\n❀ *Opciones disponibles:*\n\n> *○ Only-Prefix:*.setprefix *.*\n> *○ Multi-Prefix:*.setprefix *!/.#*\n> *○ No-Prefix:*.setprefix *noprefix*\n> *○ Reset:*.setprefix *reset*\n\n─────────────────\nꕥ *Actual:* ${current}\n─────────────────`
      }, { quoted: m })
    }

    if (value.toLowerCase() === 'reset') {
      settings.prefix = defaultPrefix
      saveSettings(settings)
      return client.sendMessage(m.chat, {
        text: `⌗°娲°₊\n❀ Prefijos restaurados correctamente\n─────────────────\nꕥ *Prefijos:* ${defaultPrefix.map(v=>`\`${v}\``).join(' ')}\n─────────────────\n> Ya puedes usar el bot con esos prefijos.`
      }, { quoted: m })
    }

    if (value.toLowerCase() === 'noprefix') {
      settings.prefix = []
      saveSettings(settings)
      return client.sendMessage(m.chat, {
        text: `⌗°娲°₊\n❀ *Modo sin prefijos activado*\n─────────────────\nꕥ Ahora el bot responderá sin necesidad de prefijo.\n─────────────────`
      }, { quoted: m })
    }

    let lista = [...new Set(value.split(''))].filter(c =>!/[a-zA-Z0-9\s]/.test(c))

    if (lista.length === 0) {
      return client.sendMessage(m.chat, {
        text: `ꕥ No se detectaron prefijos válidos.\n\n> Debes usar solo símbolos, ej: *.!/#*`
      }, { quoted: m })
    }

    if (lista.length > 6) {
      return client.sendMessage(m.chat, {
        text: `ꕥ Máximo 6 prefijos permitidos, intentaste poner ${lista.length}.`
      }, { quoted: m })
    }

    settings.prefix = lista
    saveSettings(settings)

    return client.sendMessage(m.chat, {
      text: `⌗°娲°₊\n❀ *Prefijo actualizado*\n─────────────────\nꕥ *Nuevos prefijos:* ${lista.map(v=>`\`${v}\``).join(' ')}\n─────────────────\n> Ya puedes usar el bot.`
    }, { quoted: m })
  }
  }
