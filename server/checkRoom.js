const express = require('express')
const router = express.Router()
const fs = require('fs')
const {sendJSON} = require('./utils.js')

router.get('/', function (req, res) {
  let token = req.query.hash
  let hasToken = false
  
  if(!fs.existsSync(__dirname + '/r/room.json')){
    sendJSON(res, {
      hasToken: hasToken
    })
    
    return
  }
  
  let config = JSON.parse(fs.readFileSync(__dirname + '/r/room.json'))
  let total = Object.keys(config)
  
  for (let i = 0; i < total.length; i++) {
    let el = config[[total[i]]]
    if (el.token_a === token || el.token_b === token) {
      hasToken = true
      break
    }
  }
  
  sendJSON(res, {
    hasToken: hasToken
  })
})

module.exports = router