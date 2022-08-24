<template>
  <div class="app-wrap hasTextField">
    <div class="chat-field">
      <div v-for="(item, i) in messageList" class="message-item"
           :class="{in: item.type === 'in', out: item.type === 'out'}">
        <span>{{ item.content }}</span>
      </div>
    </div>
  </div>
  <div class="text-field">
    <textarea placeholder="Enter message" v-model="userMessage" @keydown="listenKey" autofocus></textarea>
  </div>
  <div class="status-bar">
    <div class="wrap">
      Friend status: <span style="color: greenyellow">Online</span>
    </div>
  </div>
</template>

<script>
import {v4 as uuidv4} from 'uuid'
import {getHash, updateRoom} from '../js/utils.js'

export default {
  name: 'chatPage',
  computed: {},
  mounted() {
    this.initWS()
  },
  methods: {
    getHash,
    sendMessage: function (data) {
      let _ = this
      if (_.ws.readyState === 1) {
        _.ws.send(JSON.stringify(data))
      }
      _.scrollFunc()
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
            updateRoom(_.getHash(), {
              clientID: data.clientID
            })
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
      userMessage: '',
      messageList: [],
      ws: null,
      vHeight: 0
    }
  }
}
</script>

<style scoped>

</style>