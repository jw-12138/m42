const fs = require('fs')

fs.rmSync(__dirname + '/r', {
  recursive: true,
  force: true
})

console.log('done.')