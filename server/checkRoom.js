const express = require('express')
const router = express.Router()
const fs = require('fs')

router.get('/', function (req, res) {
  let token = req.query.hash
  let hasToken = false
  
  if(!fs.existsSync(__dirname + '/r/room.json')){
    res.json({
      hasToken: hasToken
    })
    
    return
  }
  
  let config = JSON.parse(fs.readFileSync(__dirname + '/r/room.json'))
  let total = Object.keys(config)
  
  let roomID = ''
  for (let i = 0; i < total.length; i++) {
    let el = config[[total[i]]]
    if (el.token_a === token || el.token_b === token) {
      hasToken = true
      roomID = el.id
      break
    }
  }
  
  res.json({
    hasToken: hasToken,
    roomID: roomID
  })
})

module.exports = router