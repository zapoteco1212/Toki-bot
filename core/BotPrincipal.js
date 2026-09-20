import { Browsers, makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

export default {
  command: ['newowner', 'setnewowner', 'botprincipal', 'rescueowner'],
  category: 'owner',
  isOwner: true, 
  run: async (client, m, args, usedPrefix, command) => {
    const numero = args[0];
    
    if (!numero) {
      return m.reply(`《✧》 Ingresa el número de WhatsApp que será el nuevo Bot Principal.\n> Ejemplo: *${usedPrefix + command} 59170000000*`);
    }

    const cleanNumber = numero.replace(/\D/g, '');
    await m.reply(`⏳ *INICIANDO PROTOCOLO DE RESCATE...*\nGenerando código de vinculación para *+${cleanNumber}*.\n\n> ⚠️ *ADVERTENCIA:* La sesión del bot principal actual será eliminada de forma permanente para dar espacio a este nuevo número.`);

    // 1. Apuntamos directamente a la carpeta del Bot Principal
    const ownerSessionPath = path.resolve('./Sessions/Owner');

    try {
      // Limpiamos los restos del bot baneado/caído
      if (fs.existsSync(ownerSessionPath)) {
        fs.rmSync(ownerSessionPath, { recursive: true, force: true });
      }
      fs.mkdirSync(ownerSessionPath, { recursive: true });
    } catch (e) {
      return m.reply('❌ Error al intentar limpiar la carpeta del Owner anterior.');
    }

    try {
      // 2. Iniciamos la autenticación de Baileys apuntando a la carpeta Owner
      const { state, saveCreds } = await useMultiFileAuthState(ownerSessionPath);
      const { version } = await fetchLatestBaileysVersion();

      // 3. Creamos el socket temporal con TU MISMA CONFIGURACIÓN
      const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Chrome'), // Mismo navegador que usas en tu startSubBot
        auth: state,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        getMessage: async () => "",
        version
      });

      sock.isInit = false;
      sock.ev.on('creds.update', saveCreds);

      // 4. Pedimos el código igual que en tu código original
      setTimeout(async () => {
        try {
          if (!sock.authState.creds.registered) {
            let codeGen = await sock.requestPairingCode(cleanNumber);
            codeGen = codeGen?.match(/.{1,4}/g)?.join("-") || codeGen;
            
            await m.reply(`「✿」 *CÓDIGO DE NUEVO PRINCIPAL* 「✿」\n\n> ➭ *Número:* +${cleanNumber}\n> ➭ *Código:* *${codeGen}*\n\n_Ingresa este código en Dispositivos Vinculados de tu nuevo WhatsApp._\n\n_El sistema te avisará por aquí en cuanto detecte la conexión._`);
          }
        } catch (err) {
          console.error("[Código Error]", err);
          m.reply(`❌ Error al solicitar el código: ${err.message}`);
        }
      }, 3000);

      // 5. Esperamos a que se conecte para reiniciar todo el sistema
      sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        
        if (connection === 'open') {
          await m.reply(`✅ *¡CONEXIÓN EXITOSA!*\n\nEl número +${cleanNumber} ha sido guardado exitosamente como el nuevo Bot Principal.\n\n🔄 *Reiniciando el servidor en 5 segundos para que tome el control absoluto...*`);
          
          // Suicidio del proceso para que el servidor (PM2, Node, etc.) lo levante de nuevo
          setTimeout(() => {
            process.exit(1); 
          }, 5000);
        }
      });

    } catch (error) {
      console.error(error);
      await m.reply(`> ❌ Error inesperado durante el rescate.\n> [Error: *${error.message}*]`);
    }
  }
};
