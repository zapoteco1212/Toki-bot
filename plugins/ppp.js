export default {
  command: ['ppp', 'ppt', 'piedra'],
  category: 'juegos',
  run: async (client, m, args) => {
    const opciones = ['piedra', 'papel', 'tijera']
    const emojis = { piedra: '🪨', papel: '📄', tijera: '✂️' }

    let eleccion = (args[0] || '').toLowerCase()
    if (!opciones.includes(eleccion)) {
      return client.sendMessage(m.chat, {
        text: `*🎮 PIEDRA PAPEL O TIJERA*\n\nUsa:\n.ppp piedra\n.ppp papel\n.ppp tijera\n\nEjemplo:.ppp piedra`
      }, { quoted: m })
    }

    const bot = opciones[Math.floor(Math.random() * 3)]

    let resultado = ''
    if (eleccion === bot) resultado = '🤝 *EMPATE*'
    else if (
      (eleccion === 'piedra' && bot === 'tijera') ||
      (eleccion === 'papel' && bot === 'piedra') ||
      (eleccion === 'tijera' && bot === 'papel')
    ) resultado = '🎉 *GANASTE*'
    else resultado = '💀 *PERDISTE*'

    const texto = `
*🎮 PIEDRA PAPEL TIJERA*

Tú: ${emojis[eleccion]} ${eleccion.toUpperCase()}
Yo: ${emojis[bot]} ${bot.toUpperCase()}

${resultado}
`.trim()

    await client.sendMessage(m.chat, { text: texto }, { quoted: m })
  }
}
