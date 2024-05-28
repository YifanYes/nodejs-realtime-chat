import express from 'express'
import logger from 'morgan'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
  socket.on('chat message', (message) => {
    io.emit('chat message', message)
  })
})

app.use(logger('dev'))

app.get('/', (_req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port), () => {
  console.log(`Server running on port ${port}`)
}