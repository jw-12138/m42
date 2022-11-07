require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const {WebSocketServer} = require('ws')
const bodyParser = require('body-parser')
const {getThatClient, checkRoomActivity, updateData, getRoom, deleteClientData} = require('./utils.js')

app.use(cors())
app.use(express.static('dist'))
app.use(bodyParser.json())

const authenticate = function (req, next) {
  next(null, req.headers['sec-websocket-key'])
}

const port = process.env.PORT
const host = process.env.HOST

if (!port || !host) {
  console.error('port or host is not defined')
  
  process.exit(1)
}

// APIs

app.use('/createRoom', require('./createRoom.js'))
app.use('/checkRoom', require('./checkRoom.js'))
app.use('/updateRoom', require('./updateRoom.js'))
app.use('/checkOnline', require('./checkOnline.js'))

setInterval(function () {
  checkRoomActivity()
}, 5000)

// ws
const wss = new WebSocketServer({
  noServer: true
})

let lookup = {}

wss.on('connection', function connection(ws, req, client) {
  lookup[client] = ws
  
  lookup[client].send(JSON.stringify({
    clientID: client
  }))
  
  setTimeout(function () {
    let cThat = getThatClient(client)
    if (cThat && lookup[cThat]) {
      lookup[cThat].send(JSON.stringify({
        ONLINE: true
      }))
    }
  }, 500)
  
  lookup[client].on('message', (data) => {
    let cThat = getThatClient(client)
    if (cThat && lookup[cThat]) {
      lookup[cThat].send(data.toString())
    }
    
    updateData(client, {
      lastActivity: Date.now()
    })
  })
  
  lookup[client].on('close', function (code, reason) {
    let cThat = getThatClient(client)
    if (cThat && lookup[cThat]) {
      lookup[cThat].send(JSON.stringify({
        ONLINE: false
      }))
    }
  
    let room = getRoom(client)
    deleteClientData(room, client)
    delete lookup[client]
  })
})

const server = app.listen(port, host, () => {
  console.log(`app is on, http://${host}:${port}`)
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
