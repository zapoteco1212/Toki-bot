import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import yargs from 'yargs/yargs'
import Database from 'better-sqlite3' // ¡El nuevo motor!

global.opts = Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

// Ahora usaremos un archivo .db en lugar de .json
const dbFile = path.join(process.cwd(), 'core', 'database.db')
const sql = new Database(dbFile)

// Creamos la tabla si no existe. 
// Guardaremos los datos categorizados (users, chats, etc.) y por ID para máxima velocidad.
sql.exec(`
  CREATE TABLE IF NOT EXISTS bot_data (
    category TEXT,
    id TEXT,
    data TEXT,
    PRIMARY KEY (category, id)
  )
`)

global.db = {
  data: {
    users: {},
    chats: {},
    settings: {},
    characters: {},
    stickerspack: {},
    communities: {},
    communityTasks: {}
  },
  chain: null,
  READ: false,
  _snapshot: '{}'
}
global.DATABASE = global.db

global.loadDatabase = function loadDatabase() {
  if (global.db.READ) return global.db.data
  global.db.READ = true
  
  try {
    // Leemos todo de SQLite y reconstruimos el objeto de memoria tal cual lo esperan tus plugins
    const rows = sql.prepare('SELECT category, id, data FROM bot_data').all()
    for (const row of rows) {
      if (!global.db.data[row.category]) global.db.data[row.category] = {}
      global.db.data[row.category][row.id] = JSON.parse(row.data)
    }
  } catch (err) {
    console.error('《✧》 Error cargando la base de datos SQLite:', err)
  }

  global.db.chain = _.chain(global.db.data)
  global.db.READ = false
  global.db._snapshot = JSON.stringify(global.db.data)
  return global.db.data
}

function hasPendingChanges() {
  return global.db._snapshot !== JSON.stringify(global.db.data)
}

global.saveDatabase = function saveDatabase() {
  if (!hasPendingChanges()) return

  try {
    const insert = sql.prepare(`
      INSERT INTO bot_data (category, id, data) 
      VALUES (@category, @id, @data) 
      ON CONFLICT(category, id) DO UPDATE SET data = excluded.data
    `)

    // Usamos una "transacción" de SQLite. Esto asegura que si el bot se apaga 
    // a la mitad del guardado, el archivo no se corrompe.
    const saveAll = sql.transaction((currentData) => {
      const memoryKeys = new Set()

      // 1. Insertamos o actualizamos los datos existentes
      for (const category of Object.keys(currentData)) {
        for (const [id, value] of Object.entries(currentData[category])) {
          memoryKeys.add(`${category}:${id}`)
          insert.run({ category, id, data: JSON.stringify(value) })
        }
      }

      // 2. Limpiamos basura: Eliminamos de SQLite lo que ya no existe en memoria
      const existingRows = sql.prepare('SELECT category, id FROM bot_data').all()
      const remove = sql.prepare('DELETE FROM bot_data WHERE category = ? AND id = ?')
      
      for (const row of existingRows) {
        if (!memoryKeys.has(`${row.category}:${row.id}`)) {
          remove.run(row.category, row.id)
        }
      }
    })

    saveAll(global.db.data)
    global.db._snapshot = JSON.stringify(global.db.data)

  } catch (err) {
    console.error('《✧》 Error guardando en SQLite:', err)
  }
}

// Bucle de guardado automático
let lastSave = Date.now()
setInterval(() => {
  const now = Date.now()
  const elapsed = now - lastSave
  // Subí el intervalo a 2 segundos (2000ms). Es más seguro para el disco duro de tu host.
  if (elapsed >= 2000 && hasPendingChanges()) {
    global.saveDatabase()
    lastSave = now
  }
}, 1000)

export default global.db
