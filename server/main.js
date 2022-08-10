const express = require('express')
const app = express()
const cors = require('cors')
const {WebSocketServer} = require('ws')

app.use(cors())

const authenticate = function (req, next) {
  next(null, req.headers['sec-websocket-key'])
}

const createRoom = require('./createRoom.js')
const port = 4010

// APIs
app.use('/createRoom', createRoom)

// ws
const wss = new WebSocketServer({
  noServer: true
})

wss.on('connection', function connection(ws, req, client) {
  ws.on('message', (data) => {
    console.log(JSON.parse(data.toString()), client)
  })
  
  ws.on('close', function (code, reason) {
    console.log(code, reason.toString())
  })
})

const server = app.listen(port, () => {
  console.log(`app is on, http://localhost:${port}`)
})

server.on('upgrade', function upgrade(request, socket, head) {
  authenticate(request, function next(err, client) {
    if (err || !client) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }
    
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request, client)
    })
  })
})
