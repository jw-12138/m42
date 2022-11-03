<template>
  <div class="app-wrap hasTextField">
    <div class="fake-field" :style="{
      height: fixHeight + 'px'
    }"></div>
    <div class="chat-field" ref="chat_field">
      <div v-for="(item, i) in messageList" class="message-item"
           :class="{in: item.type === 'in', out: item.type === 'out', system: item.type === 'system'}">
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
import {getHash, updateRoom, checkOnline, checkMeOnline} from '../js/utils.js'

export default {
  name: 'chatPage',
  computed: {},
  mounted() {
    let _ = this
    _.checkMeOnline(_.getHash(), function (err, res) {
      console.log('me', res.data.online)
      
      if (res.data.online && localStorage.getItem('room') !== _.getHash()) {
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
    try {
      setInterval(function () {
        let wh = window.innerHeight
        let th = _.$refs.chat_field.clientHeight
        let fh = wh - th - 140
        if (fh < 0) {
          fh = 0
        }
        _.fixHeight = fh
      }, 10)
    } catch (e) {
    
    }
  },
  methods: {
    getHash,
    checkMeOnline,
    checkOnline,
    checkFriendOnline() {
      let _ = this
      if (!_.clientID) {
        return false
      }
      
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
        _.ws.send(JSON.stringify(data))
      }
      _.scrollFunc()
      
      if (!_.friendOnline) {
        _.appendSystemMessage('notOnline')
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
        ws = new WebSocket(url)
      } catch (err) {
        console.log('Your browser does not support websocket, remotely controlled page refresh will not be executed!')
      }
      if (ws) {
        _.ws = ws
        ws.addEventListener('open', function (e) {
          console.log('Websocket connected!')
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
                localStorage.setItem('room', _.getHash())
              } else {
                console.log(err, res)
              }
            })
            
            _.checkFriendOnline()
          }
          
          if (data.type === 'out') {
            data.type = 'in'
            _.messageList.push(data)
            _.scrollFunc()
          }
        })
      }
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
        _.sendMessage(m)
        _.userMessage = ''
        _.scrollFunc()
      }
    }
  },
  data() {
    return {
      textareaDisabled: false,
      userMessage: '',
      messageList: [],
      ws: null,
      clientID: '',
      fixHeight: 0,
      friendOnline: false
    }
  }
}
</script>

<style scoped>

</style>