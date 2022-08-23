require('dotenv').config()

const express = require('express')
const app = express()
// const cors = require('cors')
const {WebSocketServer} = require('ws')
const bodyParser = require('body-parser')
const {getThatClient} = require('./utils.js')

// app.use(cors())
app.use(express.static('dist'))
app.use(bodyParser.json())

const authenticate = function (req, next) {
  next(null, req.headers['sec-websocket-key'])
}

const port = process.env.PORT
const host = process.env.HOST

// APIs

app.use('/createRoom', require('./createRoom.js'))
app.use('/checkRoom', require('./checkRoom.js'))
app.use('/updateRoom', require('./updateRoom.js'))

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
  
  lookup[client].on('message', (data) => {
    let cThat = getThatClient(client)
    if(cThat && lookup[cThat]){
      lookup[cThat].send(data.toString())
    }
  })
  
  lookup[client].on('close', function (code, reason) {
    delete lookup[client]
    console.log(code, reason.toString())
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
