import "./settings.js";
import main, { loadCommands } from './main.js';
import { Browsers, makeWASocket, makeCacheableSignalKeyStore, useMultiFileAuthState, fetchLatestBaileysVersion, jidDecode, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";
import chalk from "chalk";
import fs from "fs";
import readline from "readline";
import { smsg } from "./core/message.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise(res => rl.question(text, res))

await loadCommands()

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionName);
  const { version } = await fetchLatestBaileysVersion();
  const logger = pino({ level: "silent" });
  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: Browsers.macOS('Chrome'),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    getMessage: async () => "",
  });
  global.client = sock;
  sock.ev.on("creds.update", saveCreds);

  if (!state.creds.registered) {
    console.log(chalk.yellow("No hay sesión, generando código..."))
    let phone = await question(chalk.magentaBright('Tu número con país (ej: 5217442573779) ---> '))
    phone = phone.replace(/\D/g,'')
    if (phone.startsWith('52') && !phone.startsWith('521') && phone.length >= 12) phone = '521' + phone.slice(2)
    try {
      await new Promise(r=>setTimeout(r,2000))
      let code = await sock.requestPairingCode(phone)
      code = code?.match(/.{1,4}/g)?.join("-") || code
      console.log(chalk.bgGreen.black(`\n TU CÓDIGO: ${code} \n`))
    } catch(e){ console.log(chalk.red("Error:", e.message)) }
  } else {
    console.log(chalk.blue("Sesión encontrada, conectando..."))
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode || 0;
      console.log(chalk.yellow(`Desconectado: ${reason}, reconectando...`))
      if (reason !== DisconnectReason.loggedOut) setTimeout(startBot, 3000);
    }
    if (connection === "open") {
      try{ rl.close() }catch{}
      console.log(chalk.green.bold(`\n[ ✿ ] Conectado - ${sock.user.name}\n`))
    }
  });

  sock.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      const kay = chatUpdate.messages[0];
      if (!kay?.message) return;
      if (kay.key.remoteJid === 'status@broadcast') return
      const m = await smsg(sock, kay);
      await main(sock, m, chatUpdate);
    } catch (err) {
      console.log("Error msg:", err.message)
    }
  });

  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    }
    return jid;
  };
}

startBot()
