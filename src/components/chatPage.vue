<template>
  <div style="position: fixed; left: 0; top: 0; color: red; z-index: 20000; font-size: 24px">{{vHeight}}</div>
  <div class="app-wrap hasTextField" ref="app_wrap" :style="{height: vHeight + 'px'}">
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
  computed: {
    vHeight: function () {
      const viewport = window.visualViewport
      return viewport ? viewport.height : 0
    }
  },
  mounted() {
    this.initWS()
    this.scrollFunc()
    let _ = this
    window.visualViewport.addEventListener('resize', function () {
      let viewport = window.visualViewport
      _.vHeight = viewport ? viewport.height - viewport.offsetTop : 0
    })
    setInterval(function () {
      _.vHeight = VisualViewport ? VisualViewport.height : 0
    }, 20)
  },
  methods: {
    getHash,
    scrollFunc: function () {
      let element = this.$refs.app_wrap
      setTimeout(function () {
        element.scrollTop = element.scrollHeight
      }, 0)
    },
    sendMessage: function (data) {
      let _ = this
      if(_.ws.readyState === 1){
        _.ws.send(JSON.stringify(data))
      }
    },
    initWS() {
      let ws = null
      let _ = this
      try {
        let host = location.host
        let protocol = location.protocol
        let url = (protocol === 'http:' ? 'ws://': 'wss://') + host
        ws = new WebSocket(url)
      } catch (err) {
        console.log('Your browser does not support websocket, remotely controlled page refresh will not be executed!');
      }
      if(ws){
        _.ws = ws
        ws.addEventListener('open', function (e) {
          console.log('Websocket connected!');
        })
      
        ws.addEventListener('error', function (err) {
          console.log(err)
        })
      
        ws.addEventListener('close', function () {
          console.log('Websocket closed!')
        })
      
        ws.addEventListener('message', function (e) {
          let data = JSON.parse(e.data)
          if(data.clientID){
            updateRoom(_.getHash(), {
              clientID: data.clientID
            })
          }
          
          if(data.type === 'out'){
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
    }
  }
}
</script>

<style scoped>

</style>