const fs = require('fs')
const lodash = require('lodash')

function updateData(id, newData) {
  let roomID = ''
  let user = ''
  let path = __dirname + '/r/room.json'
  let config = JSON.parse(fs.readFileSync(path))
  let keys = Object.keys(config)
  for (let i = 0; i < keys.length; i++) {
    let el = config[keys[i]]
    if (el.token_a === id || el.token_b === id) {
      roomID = keys[i]
      if (el.token_a === id) {
        user = 'a'
      } else {
        user = 'b'
      }
    }
    if (el.clientID_a === id || el.clientID_b === id) {
      roomID = keys[i]
      if (el.clientID_a === id) {
        user = 'a'
      } else {
        user = 'b'
      }
    }
  }
  
  if (newData['clientID']) {
    newData['clientID_' + user] = newData.clientID
    delete newData['clientID']
  }
  
  let room = config[roomID]
  
  lodash.assign(room, newData)
  config[roomID] = room
  fs.writeFileSync(path, JSON.stringify(config))
  
  console.log(config[roomID])
}

function sendJSON(res, data) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data || {}))
}

function getThatClient(cThis) {
  let path = __dirname + '/r/room.json'
  let config = JSON.parse(fs.readFileSync(path))
  let keys = Object.keys(config)
  
  for (let i = 0; i < keys.length; i++) {
    let el = config[keys[i]]
    if(el.clientID_a === cThis){
      return el.clientID_b
    }
    if(el.clientID_b === cThis){
      return el.clientID_a
    }
  }
  return null
}

function isRoomExist(id) {
  let path = __dirname + '/r/room.json'
  let config = JSON.parse(fs.readFileSync(path))
  let keys = Object.keys(config)
  
  for (let i = 0; i < keys.length; i++) {
    let el = config[keys[i]]
  
    return el.clientID_a === id || el.clientID_b === id;
  }
}

function checkRoomActivity() {
  let path = __dirname + '/r/room.json'
  if(!fs.existsSync(path)){
    return
  }
  let config = JSON.parse(fs.readFileSync(path))
  let keys = Object.keys(config)
  let now = Date.now()
  let offset = 1000 * 60 * 15 // 15 min
  
  let idForDelete = []
  
  for (let i = 0; i < keys.length; i++) {
    let el = config[keys[i]]
    if(now - el.lastActivity > offset ){
      idForDelete.push(el.id)
    }
  }
  
  idForDelete.forEach(el => {
    let p = __dirname + '/r/' + el
    fs.rmSync(p, {
      force: true,
      recursive: true
    })
    
    delete config[el]
  })
  if(idForDelete.length){
    fs.writeFileSync(path, JSON.stringify(config))
  }
}

module.exports = {
  updateData,
  sendJSON,
  getThatClient,
  checkRoomActivity
}