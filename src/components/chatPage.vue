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

export default {
  name: 'chatPage',
  mounted() {
    this.initWS()
  },
  methods: {
    sendMessage: function (data) {
      let _ = this
      _.ws.send(JSON.stringify(data))
    },
    initWS() {
      let ws = null
      let _ = this
      try {
        ws = new WebSocket('ws://localhost:4010')
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
        
        })
      
        ws.addEventListener('message', function (e) {
          console.log(JSON.parse(e.data))
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