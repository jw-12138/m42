import axios from 'axios'
import api from './api.js'

export function getHash(){
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

export function checkOnline(hash, clientID, cb){
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