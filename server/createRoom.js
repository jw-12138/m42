const express = require('express')
const router = express.Router()
const nanoid = require('nanoid')
const fs = require('fs')
const {sendJSON} = require('./utils.js')

router.get('/', (req, res) => {
  
  let room = {
    id: nanoid(),
    token_a: nanoid(8),
    token_b: nanoid(8),
    status: 0,
    createdAt: Date.now(),
    lastActivity: Date.now()
  }
  
  let room_path = __dirname + '/r/' + room.id
  
  createRoom(room_path, room)
  addRoomConfig(room)
  countRoom()
  
  sendJSON(res, room)
})

function countRoom() {
  let count = __dirname + '/r/count.json'
  if (!fs.existsSync(count)) {
    fs.writeFileSync(count, '{"count": 0}')
  }
  
  let countData = JSON.parse(fs.readFileSync(count))
  countData.count++
  
  fs.writeFileSync(count, JSON.stringify(countData))
}

function addRoomConfig(room) {
  let roomFile = __dirname + '/r/room.json'
  if (!fs.existsSync(roomFile)) {
    fs.writeFileSync(roomFile, '{}')
  }
  
  let roomData = JSON.parse(fs.readFileSync(roomFile))
  roomData[room.id] = room
  
  fs.writeFileSync(roomFile, JSON.stringify(roomData))
}

function createRoom(path, room) {
  if (!fs.existsSync(__dirname + '/r')) {
    fs.mkdirSync(__dirname + '/r')
  }
  fs.mkdirSync(path)
  console.log('room created [' + room.id + ']')
}

module.exports = router