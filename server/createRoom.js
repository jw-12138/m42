const express = require('express')
const router = express.Router()
const {v4} = require('uuid')
const fs = require('fs')
const {sendJSON} = require('./utils.js')

router.get('/', (req, res) => {
  
  let room = {
    id: v4(),
    token_a: v4(),
    token_b: v4(),
    status: 0,
    createdAt: Date.now(),
    lastActivity: Date.now()
  }
  
  let room_path = __dirname + '/r/' + room.id
  
  createRoom(room_path, room)
  addRoomConfig(room)
  
  sendJSON(res, room)
})

function addRoomConfig(room){
  let roomFile = __dirname + '/r/room.json'
  if(!fs.existsSync(roomFile)){
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