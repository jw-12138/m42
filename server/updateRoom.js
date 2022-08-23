const express = require('express')
const router = express.Router()
const {sendJSON, updateData} = require('./utils.js')

router.post('/', (req, res) => {
  let data = req.body
  updateData(data.id, data.newData)
  sendJSON(res, {
    status: 0
  })
})

module.exports = router