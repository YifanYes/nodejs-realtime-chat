import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
import express from 'express'
import logger from 'morgan'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

dotenv.config()

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app, {
  connectionStateRecovery: {}
})
const io = new Server(server)
const db = createClient({
  url: "libsql://welcomed-blockbuster-yifanyes.turso.io",
  authToken: process.env.DB_TOKEN
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS  MESSAGES (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
)`)

io.on('connection', (socket) => {
  socket.on('chat message', async (message) => {
    // Persisting message in database
    let result
    try {
      result = await db.execute({
        sql: `INSERT INTO messages (content) VALUES (:message)`,
        args: { message }
      })
    } catch (error) {
      console.error(error)
      return
    }

    // Broadcasting message to open connections
    io.emit('chat message', message, result.lastInsertRowid.toString())
  })
})

app.use(logger('dev'))

app.get('/', (_req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port), () => {
  console.log(`Server running on port ${port}`)
}