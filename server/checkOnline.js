const express = require('express')
const router = express.Router()
const fs = require('fs')

router.post('/', function (req, res) {
  let hash = req.body.hash
  let type = req.body.type
  let clientID = req.body.clientID
  
  if (!fs.existsSync(__dirname + '/r/room.json')) {
    res.status(503).json({
      'message': 'no room'
    })
    
    return
  }
  
  let config = JSON.parse(fs.readFileSync(__dirname + '/r/room.json'))
  let config_keys = Object.keys(config)
  
  let room = null
  
  if(type === 'me'){
    let online = false
    for (let i = 0; i < config_keys.length; i++) {
      let el = config[config_keys[i]]
    
      if(el.token_a === hash && el.clientID_a){
        online = true
        break
      }
  
      if(el.token_b === hash && el.clientID_b){
        online = true
        break
      }
    }
    
    res.json({
      online: online
    })
    
    return
  }
  
  
  for (let i = 0; i < config_keys.length; i++) {
    let el = config[config_keys[i]]
    
    if(el.token_a === hash || el.token_b === hash){
      room = el
      break
    }
  }
  
  if (!room) {
    res.status(503).json({
      'message': 'no related room'
    })
    
    return
  }
  
  let online = false
  if (room['clientID_a'] === clientID) {
    if(room['clientID_b']){
      online = true
    }
  }

  if (room['clientID_b'] === clientID) {
    if(room['clientID_a']){
      online = true
    }
  }
  
  res.json({
    online: online,
    clientID: clientID
  })
})

module.exports = router