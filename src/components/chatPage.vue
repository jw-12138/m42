<template>
  <div class="app-wrap hasTextField">
    <div class="chat-field" ref="chat_field">
      <div v-for="(item, i) in messageList" :key="i"
           class="message-item" :class="item.type">
        <span>{{ item.content }}</span>
      </div>
    </div>
  </div>
  <div class="text-field">
    <textarea placeholder="Enter message" v-model="userMessage" @keydown="listenKey" autofocus
              :disabled="textareaDisabled"></textarea>
  </div>
  <div class="status-bar">
    <div class="wrap">
      Friend Online: <span :style="{color: friendOnline ? 'greenyellow' : 'red'}">{{ friendOnline ? 'Y' : 'N' }}</span>
    </div>
  </div>
</template>

<script>
import {v4 as uuidv4} from 'uuid'
import CryptoJS from 'crypto-js'
import {checkMeOnline, checkOnline, getHash, updateRoom, rnd, generateKey} from '../js/utils.js'

export default {
  name: 'chatPage',
  computed: {},
  mounted() {
    let _ = this
    _.setKey()
    _.checkMeOnline(_.getHash(), function (err, res) {
      if (res.data.online && localStorage.getItem('hash') !== _.getHash()) {
        let m = {
          content: 'you have already logged in somewhere',
          type: 'system'
        }
        let m2 = {
          content: 'you will be redirected to the main page in 5 seconds',
          type: 'system'
        }
        _.textareaDisabled = true
        _.messageList.push(m)
        
        setTimeout(() => {
          _.messageList.push(m2)
        }, 1000)
        
        setTimeout(function () {
          location.href = location.href.split('#')[0]
        }, 6000)
        
        return false
      }
      
      _.initWS()
    })
  },
  methods: {
    rnd,
    generateKey,
    getHash,
    checkMeOnline,
    checkOnline,
    setKey(){
      let _ = this
      if(!localStorage.getItem('myKey') || localStorage.getItem('myKey') === ''){
        localStorage.setItem('myKey', _.generateKey(_.rnd()).toString(CryptoJS.enc.HEX))
      }
    },
    checkFriendOnline() {
      let _ = this
      _.checkOnline(_.getHash(), _.clientID, function (err, res) {
        _.friendOnline = res.data.online ? res.data.online : false
        
        setTimeout(function () {
          _.checkFriendOnline()
        }, 1500)
      })
    },
    sendMessage: function (data) {
      let _ = this
      if (_.ws.readyState === 1) {
        let old_message = data.content
        let ciphertext = CryptoJS.Rabbit.encrypt(data.content, localStorage.getItem('myKey'))
        data.content = ciphertext.toString(CryptoJS.enc.HEX)
        _.ws.send(JSON.stringify(data))
        data.content = old_message
      }
      _.scrollFunc()
      
      if (!_.friendOnline) {
        _.appendSystemMessage('notOnline')
        _.scrollFunc()
      }
    },
    appendSystemMessage(type) {
      let message = ''
      let _ = this
      if (type === 'notOnline') {
        message = 'your friend is not online'
      }
      
      let m = {
        content: message,
        type: 'system',
        status: 0,
        hash: uuidv4(),
        timestamp: Date.now()
      }
      
      _.messageList.push(m)
    },
    scrollFunc() {
      setTimeout(function () {
        window.scrollTo(0, document.body.scrollHeight)
      }, 50)
    },
    initWS() {
      let ws = null
      let _ = this
      try {
        let host = location.host
        let protocol = location.protocol
        let url = (protocol === 'http:' ? 'ws://' : 'wss://') + host
        if(location.hostname === 'localhost'){
          url = 'ws://localhost:5009'
        }
        ws = new WebSocket(url)
      } catch (err) {
        console.log('Your browser does not support websocket, remotely controlled page refresh will not be executed!')
      }
      if (ws) {
        _.ws = ws
        ws.addEventListener('open', function (e) {
          console.log('Websocket connected!')
          _.messageList.push({
            type: 'system g',
            content: '✨ Connection Established (E2EE)'
          })
          _.messageList.push({
            type: 'system',
            content: '--//--'
          })
          _.messageList.push({
            type: 'system l',
            content: '🙌 Things You Need To Know!'
          })
          _.messageList.push({
            type: 'system i l',
            content: '1. We store NOTHING!'
          })
          _.messageList.push({
            type: 'system i l',
            content: '2. E2E is not absolutely SAFE!'
          })
          _.messageList.push({
            type: 'system i l',
            content: '3. Your message will only be visible when your friend is online!'
          })
          _.messageList.push({
            type: 'system i l',
            content: '4. Have fun! 🎈'
          })
          _.messageList.push({
            type: 'system',
            content: '--//--'
          })
        })
        
        ws.addEventListener('error', function (err) {
          console.log(err)
        })
        
        ws.addEventListener('close', function () {
          console.log('Websocket closed!')
        })
        
        ws.addEventListener('message', function (e) {
          let data = JSON.parse(e.data)
          if (data.clientID) {
            _.clientID = data.clientID
            updateRoom(_.getHash(), {
              clientID: data.clientID
            }, function (err, res) {
              if (res) {
                localStorage.setItem('hash', _.getHash())
                _.checkFriendOnline()
              } else {
                console.log(err, res)
              }
            })
          }
          
          if (data.KEY) {
            localStorage.setItem('theirKey', data.KEY)
          }
          
          if (data.type === 'out') {
            data.type = 'in'
            let ciphertext = CryptoJS.Rabbit.decrypt(data.content, localStorage.getItem('theirKey'))
            data.content = ciphertext.toString(CryptoJS.enc.Utf8)
            _.messageList.push(data)
            _.scrollFunc()
          }
        })
      }
    },
    sendKey() {
      let _ = this
      _.ws.send(JSON.stringify({
        KEY: localStorage.getItem('myKey')
      }))
    },
    listenKey(e) {
      let _ = this
      if (e.key !== 'Enter') {
        return false
      }
      e.preventDefault()
      if (_.userMessage) {
        let m = {
          content: _.userMessage,
          type: 'out',
          status: 0,
          hash: uuidv4(),
          timestamp: Date.now()
        }
        _.messageList.push(m)
        _.userMessage = ''
        _.scrollFunc()
        _.sendMessage(m)
      }
    }
  },
  data() {
    return {
      textareaDisabled: false,
      userMessage: '',
      messageList: [],
      ws: null,
      my_key: '',
      their_key: '',
      clientID: '',
      fixHeight: 0,
      friendOnline: false
    }
  },
  watch: {
    friendOnline(val){
      if(val){
        this.sendKey()
      }
    }
  }
}
</script>

<style scoped>

</style>