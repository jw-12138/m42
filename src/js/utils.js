import axios from 'axios'
import api from './api.js'

export function getHash() {
  return location.hash.replace('#/', '')
}

export function checkHash(cb) {
  let hash = getHash()
  axios.get(api.checkRoom + '?hash=' + hash).then(res => {
    cb(null, res)
  }).catch(err => {
    console.log(err)
    cb(err)
  })
}

export function updateRoom(id, newData, cb) {
  axios.post(api.updateRoom, {
    id: id,
    newData: newData
  }).then(res => {
    cb && cb(null, res)
  }).catch(err => {
    cb && cb(err)
  })
}

export function checkOnline(hash, clientID, cb) {
  axios.post(api.checkOnline, {
    hash: hash,
    clientID: clientID
  }).then(res => {
    cb && cb(null, res)
  }).catch(err => {
    cb && cb(err)
  })
}

export function checkMeOnline(hash, cb) {
  axios.post(api.checkOnline, {
    hash: hash,
    type: 'me'
  }).then(res => {
    cb && cb(null, res)
  }).catch(err => {
    cb && cb(err)
  })
}

export function generateKey(cb) {
  let pair = {
    private: {},
    public: {}
  }
  window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: {name: 'SHA-256'}
    },
    true,
    ['encrypt', 'decrypt']
  )
    .then(function (key) {
      pair.public = key.publicKey
      pair.private = key.privateKey
      exportPrivate()
    })
    .catch(function (err) {
      console.error(err)
    })
  
  let keyData = {}
  
  let exportPrivate = function () {
    window.crypto.subtle.exportKey(
      'jwk',
      pair.private
    )
      .then(function (key) {
        keyData.private = key
        exportPublic()
      })
      .catch(function (err) {
        console.error(err)
      })
  }
  
  let exportPublic = function () {
    window.crypto.subtle.exportKey(
      'jwk',
      pair.public
    )
      .then(function (key) {
        keyData.public = key
        cb && cb(keyData)
      })
      .catch(function (err) {
        console.error(err)
      })
  }
}

export function encrypt(key, data, cb) {
  window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    key,
    new TextEncoder().encode(data)
  )
    .then(function (encrypted) {
      let u = new Uint8Array(encrypted)
      let a = Array.from(u)
      cb && cb(a)
    })
    .catch(function (err) {
      console.error(err)
    })
}

export function decrypt(key, data, cb) {
  let u = Uint8Array.from(data)
  window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP'
    },
    key,
    u
  )
    .then(function (decrypted) {
      let dec = new Uint8Array(decrypted)
      cb && cb(new TextDecoder().decode(dec))
    })
    .catch(function (err) {
      console.error(err)
    })
}

export function importKey(type, key, cb) {
  window.crypto.subtle.importKey(
    'jwk',
    key,
    {
      name: 'RSA-OAEP',
      hash: {name: 'SHA-256'}
    },
    false,
    type === 'private' ? ['decrypt'] : ['encrypt']
  )
    .then(function (publicKey) {
      cb && cb(publicKey)
    })
    .catch(function (err) {
      console.error(err)
    })
}

export function splitAsChunk(str, cb) {
  str = encodeURI(str)
  let blob = new Blob([str], {
    type: 'text/plain'
  })
  let splitSize = 150
  let chunkArr = []
  let loopTimes = Math.ceil(blob.size / splitSize)
  for (let i = 0; i < loopTimes; i++) {
    let el = blob.slice(i * splitSize, (i + 1) * splitSize)
    el.text().then(res => {
      chunkArr[i] = res
      if (i + 1 === loopTimes) {
        cb && cb(null, chunkArr)
      }
    }).catch(err => {
      cb && cb(err)
    })
  }
}

export function reformChunkAsString(chunks, cb) {
  let blob = new Blob(chunks, {
    type: 'text/plain'
  })
  blob.text().then(res => {
    cb && cb(null, decodeURI(res))
  }).catch(err => {
    cb && cb(err)
  })
}