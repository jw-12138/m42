const express = require('express')
const router = express.Router()
const {v4} = require('uuid')

router.get('/', (req, res) => {
  
  let room = {
    roomID: v4(),
    token_a: v4(),
    token_b: v4()
  }
  
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(room))
})

module.exports = router