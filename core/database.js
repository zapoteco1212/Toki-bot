
import fs from 'fs'
import path from 'path'

const DB_PATH = './database.json'

function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users: {},
      chats: {},
      settings: {},
      economy: {}
    }, null, 2))
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH))
  if (!data.users) data.users = {}
  if (!data.chats) data.chats = {}
  if (!data.settings) data.settings = {}
  return data
}

export function loadDB() {
  return ensureDB()
}

export function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null,
export function initGlobalDB() {
  const data = ensureDB()
  if (!global.db) global.db = { data }
  else global.db.data = data

  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.settings) global.db.data.settings = {}

  
  setInterval(() => {
    try {
      saveDB(global.db.data)
    } catch {}
  }, 30 * 1000)

  return global.db.data
}

export function getUser(jid, chatId) {
  const db = global.db?.data || ensureDB()
  if (!db.users[jid]) {
    db.users[jid] = {
      coins: 0,
      bank: 0,
      exp: 0,
      level: 1,
      lastwork: 0,
      lastcrime: 0,
      lastmine: 0,
      lastdaily: 0,
      lastweekly: 0,
      lastmonthly: 0,
      laststeal: 0,
      lastslut: 0,
      lastmat: 0,
      lastcocinar: 0,
      lastinvoke: 0,
      name: jid.split('@')[0]
    }
  }
  return db.users[jid]
}

export function getChat(chatId) {
  const db = global.db?.data || ensureDB()
  if (!db.chats[chatId]) {
    db.chats[chatId] = {
      economy: true,
      adminonly: false,
      users: {},
      lastCofre: 0,
      welcome: true
    }
  }
  if (!db.chats[chatId].users) db.chats[chatId].users = {}
  return db.chats[chatId]
}

export function getChatUser(chatId, jid) {
  const chat = getChat(chatId)
  if (!chat.users[jid]) {
    chat.users[jid] = {
      coins: 0,
      bank: 0,
      lastcrime: 0,
      lastmine: 0,
      lastwork: 0,
      lastmat: 0,
      lastslut: 0,
      lastcocinar: 0,
      laststeal: 0,
      lastinvoke: 0,
      lastdaily: 0,
      lastweekly: 0,
      lastmonthly: 0,
    }
  }
  return chat.users[jid]
      }
