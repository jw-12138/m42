import axios from 'axios'
import api from './api.js'

export function getHash(){
  return location.hash.replace('#/', '')
}

export function checkHash(callback) {
  let hash = getHash()
  axios.get(api.checkRoom + '?hash=' + hash).then(res => {
    if (res.data.hasToken) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  }).catch(err => {
    console.log(err)
    callback(err, false)
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

export function checkOnline(roomID, clientID, cb){
  axios.get(api.checkOnline + `?hash=${roomID}&clientID=${clientID}`).then(res => {
    cb && cb(null, res)
  }).catch(err => {
    cb && cb(err)
  })
}

export function checkMeOnline(hash, cb) {
  axios.get(api.checkOnline + `?hash=${hash}&type=me`).then(res => {
    cb && cb(null, res)
  }).catch(err => {
    cb && cb(err)
  })
}