<template>
  <div class="app-wrap hasTextField">
    <div class="fake-field" :style="{
        height: fixHeight + 'px'
      }"></div>
    <div class="chat-field" ref="chat_field">
      <div v-for="(item, i) in messageList" :key="i" class="message-item" :class="item.type">
        <span v-if="!item.fileType">{{ item.content }}</span>
        <span v-if="item.fileType && item.fileType.startsWith('image/')" :class="{
            img: item.fileType.startsWith('image/')
          }"><img :src="item.content" @click="viewFile(item.content, item.name)" alt=""/></span>
        
        <span
          v-if="item.fileType && !item.fileType.startsWith('image/') && item.fileType !== 'video/mp4' && !item.fileType.startsWith('audio/')"
          @click="viewFile(item.content, item.name)" :class="{
            file: item.fileType && !item.fileType.startsWith('image/') && item.fileType !== 'video/mp4' && !item.fileType.startsWith('audio/')
          }">
          <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48">
            <path
              d="M24 31.4q-.35 0-.625-.1t-.575-.4l-7.7-7.7q-.5-.5-.475-1.2.025-.7.525-1.2.55-.5 1.25-.5t1.2.5l4.7 4.75V8.85q0-.7.5-1.2t1.2-.5q.75 0 1.225.5.475.5.475 1.2v16.7l4.75-4.75q.5-.5 1.2-.5t1.25.5q.5.5.5 1.2t-.5 1.2l-7.7 7.7q-.3.3-.6.4-.3.1-.6.1Zm-13.2 9.15q-1.35 0-2.375-1T7.4 37.15v-6q0-.7.5-1.2t1.25-.5q.7 0 1.175.5.475.5.475 1.2v6h26.35v-6q0-.7.5-1.2t1.25-.5q.7 0 1.175.5.475.5.475 1.2v6q0 1.4-1 2.4t-2.4 1Z"/></svg><br/>
          <em>{{ item.name }}</em>
        </span>
        <span v-if="item.fileType && item.fileType === 'video/mp4'" :class="{
          media: item.fileType && item.fileType === 'video/mp4'
        }">
          {{ item.name }}
          <br>
          <video :src="item.content" controls></video>
        </span>
        <span
          v-if="item.fileType && (item.fileType === 'audio/mpeg' || item.fileType === 'audio/wav' || item.fileType === 'audio/ogg')"
          :class="{
          media: item.fileType && (item.fileType === 'audio/mpeg' || item.fileType === 'audio/wav' || item.fileType === 'audio/ogg')
        }">
          {{ item.name }}
          <br>
          <audio :src="item.content" controls></audio>
        </span>
      </div>
    </div>
  </div>
  <div class="text-field">
    <input type="file" class="file" id="file" @change="formFile"/>
    <textarea placeholder="Write something here, hit Enter to send" v-model="userMessage" autofocus
              :disabled="textareaDisabled" @compositionstart="userIsComposting = true"
              @compositionend="userIsComposting = false" id="textArea"></textarea>
    <button class="attach-file">
      <label for="file">
        <img src="../img/attach.svg" alt="">
      </label>
    </button>
    <button class="send-message" @click="formMessage">
      <img src="../img/send.svg" alt="">
    </button>
  </div>
  <div class="status-bar">
    <div class="wrap">
      Friend Online:
      <span :class="{
        online: friendOnline,
        offline: !friendOnline
      }">{{ friendOnline ? 'Y' : 'N' }}</span>
      &emsp;&emsp;
      <a href="javascript:" role="button" @click="quitChat">👋 Quit Chat</a>
    </div>
  </div>
  <div class="file-upload" v-show="imagePreview || waitingForFile">
    <div class="title">Please confirm</div>
    <div class="img">
      <img v-show="fileTypePreview.startsWith('image/')" :src="imagePreviewSrc" alt=""/>
      <div class="name">{{ imagePreviewName }}</div>
      <div class="process" v-show="waitingForFile">
        Separating as chunks: {{ (fileSeparateProgress * 100).toFixed(2) }}%
      </div>
    </div>
    <div class="buttons">
      <button @click="sendFile" id="sendFile" :disabled="waitingForFile">Send</button>
      <button class="info" @click="removeFile" :disabled="waitingForFile">Cancel</button>
    </div>
  </div>
</template>

<script>
import nanoid from 'nanoid'
import CryptoJS from 'crypto-js'
import {
  checkMeOnline,
  checkOnline,
  decrypt,
  encrypt,
  generateKey,
  getHash,
  importKey,
  reformChunkAsString,
  rnd,
  splitAsChunk,
  updateRoom
} from '../js/utils.js'

export default {
  name: 'chatPage',
  computed: {},
  mounted() {
    let _ = this
    window.addEventListener('keydown', function (e) {
      _.listenKey(e)
    })
    setTimeout(function () {
      _.checkFriendOnlineBurst = 30 * 1000
    }, 5000)
    window.addEventListener('paste', _.listenPaste)
    setInterval(_.setFixHeight, 20)
    _.checkMeOnline(_.getHash(), function (err, res) {
      if (err) {
        console.log(err)
        return
      }
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
      
      _.setKey()
    })
  },
  methods: {
    generateKey,
    getHash,
    checkMeOnline,
    checkOnline,
    encrypt,
    decrypt,
    importKey,
    listenPaste(e) {
      let _ = this
      let fakeEvent = {
        target: {
          files: []
        }
      }
      if (!e.clipboardData.files.length) {
        return
      }
      fakeEvent.target.files[0] = e.clipboardData.files[0]
      _.formFile(fakeEvent)
    },
    validFileSize(file) {
      if (file.size > 30 * 1000 * 1000) {
        alert(
          `🧐 This File (${(file.size / 1000 / 1000).toFixed(
            2
          )}Mb) is way too big for file transfer, we recommend you use a file sharing service in this case.`
        )
        this.removeFile()
        return false
      }
      
      return true
    },
    sendFile() {
      let _ = this
      let password = rnd()
      let ciphertext = CryptoJS.Rabbit.encrypt(_.imagePreviewSrc, password)
      let content = ciphertext.toString(CryptoJS.enc.HEX)
      
      _.importKey('public', JSON.parse(localStorage.getItem('theirKey')), function (pubKey) {
        _.encrypt(pubKey, password, function (err, res) {
          if (err) {
            console.log(err)
            return
          }
          
          let m = {
            content: content,
            old_message: _.imagePreviewSrc,
            password: res,
            type: 'out',
            name: _.imagePreviewName,
            fileType: _.fileTypePreview,
            status: 0,
            hash: nanoid(),
            timestamp: Date.now()
          }
          _.removeFile()
          _.sendMessage(m)
        })
      })
    },
    removeFile() {
      document.getElementById('file').value = ''
      this.imagePreviewSrc = ''
      this.imagePreview = false
      this.imagePreviewName = ''
      this.fileTypePreview = ''
      this.userMessage = ''
    },
    formFile(e) {
      let _ = this
      let file = e.target.files[0]
      if (!file) {
        return
      }
      if (!_.validFileSize(file)) {
        return
      }
      _.fileToBase64(file, (err, res) => {
        if (err) {
          console.log(err)
          return
        }
        _.imagePreviewName = file.name
        _.imagePreviewSrc = res
        _.imagePreview = true
        _.fileTypePreview = file.type || 'unknown'
        document.getElementById('sendFile').focus()
      })
    },
    fileToBase64(file, cb) {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = function () {
        cb && cb(null, reader.result)
      }
      reader.onerror = function (err) {
        cb && cb(err)
      }
    },
    setFixHeight() {
      let _ = this
      let chatHeight = _.$refs.chat_field.clientHeight
      let windowHeight = document.querySelector('.app-wrap.hasTextField').clientHeight
      _.fixHeight = windowHeight - chatHeight - 30
    },
    viewFile(src, name) {
      let downloadLink = document.createElement('a')
      document.body.appendChild(downloadLink)
      downloadLink.classList.add('hiddenLinks')
      downloadLink.href = src
      downloadLink.target = '_blank'
      downloadLink.download = name
      downloadLink.click()
    },
    setKey() {
      let _ = this
      _.generateKey(function (res) {
        localStorage.setItem('myPubKey', JSON.stringify(res.public))
        localStorage.setItem('myPriKey', JSON.stringify(res.private))
        _.initWS()
      })
    },
    quitChat() {
      let c = confirm('Are you sure?')
      if (c) {
        location.href = location.href.split('#')[0]
      }
    },
    checkFriendOnline(noRecurring) {
      let _ = this
      _.checkOnline(_.getHash(), _.clientID, function (err, res) {
        setTimeout(function () {
          if(!noRecurring){
            _.checkFriendOnline()
          }
        }, _.checkFriendOnlineBurst)
        
        if (err) {
          console.log(err)
          _.friendOnline = false
          return
        }
        _.friendOnline = res.data.online ? res.data.online : false
      })
    },
    sendMessage: function (data) {
      let _ = this
      _.checkFriendOnline(1)
      if (_.ws.readyState === 1) {
        let old_message = data.old_message
        delete data.old_message
        
        if (localStorage.getItem('theirKey') && _.friendOnline) {
          if (data.password) {
            _.ws.send(JSON.stringify(data))
            data.content = old_message
            _.userMessage = ''
            _.messageList.push(data)
            _.scrollFunc()
          } else {
            _.importKey('public', JSON.parse(localStorage.getItem('theirKey')), function (pubKey) {
              data.content.data.forEach((el, index) => {
                _.encrypt(pubKey, el.content, function (err, res) {
                  el.content = res
                  data.content.data[index] = el
                  
                  if (index + 1 === data.content.data.length) {
                    _.ws.send(JSON.stringify(data))
                    
                    data.content = old_message
                    _.userMessage = ''
                    _.messageList.push(data)
                    _.scrollFunc()
                  }
                })
              })
            })
          }
        } else if (!_.friendOnline && localStorage.getItem('theirKey')) {
          _.messageList.push({
            type: 'system',
            content: 'your friend is not online'
          })
          _.scrollFunc()
        } else {
          _.messageList.push({
            type: 'system',
            content: 'This message is not sent, cause your friend haven\'t sent their pubKey to you'
          })
        }
      }
      _.scrollFunc()
    },
    scrollFunc() {
      setTimeout(function () {
        document
          .querySelector('.app-wrap.hasTextField')
          .scrollTo(0, document.querySelector('.app-wrap.hasTextField').scrollHeight)
      }, 50)
    },
    initWS() {
      let ws = null
      let _ = this
      try {
        let host = location.host
        let protocol = location.protocol
        let url = (protocol === 'http:' ? 'ws://' : 'wss://') + host
        if (location.hostname === 'localhost') {
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
          clearInterval(_.reInitWebsocketInterval)
          if (_.reInitSignal) {
            _.messageList.push({
              type: 'system g',
              content: '✨ Connection Established'
            })
            return false
          }
          _.checkFriendOnline()
          _.messageList.push({
            type: 'system g',
            content: '✨ Connection Established'
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
            content: '2. E2EE is not absolutely SAFE!'
          })
          _.messageList.push({
            type: 'system i l',
            content: '3. Have fun! 🎈'
          })
          _.messageList.push({
            type: 'system',
            content: '--//--'
          })
  
          _.ws.send(JSON.stringify({
            ONLINE: true
          }))
          
          if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            _.messageList.push({
              type: 'system w',
              content: 'warning: you\'re visiting this website through http protocol which is considered unsafe.'
            })
          }
        })
        
        ws.addEventListener('error', function (err) {
          console.log(err)
        })
        
        ws.addEventListener('close', function () {
          console.log('Websocket closed!')
          _.friendOnline = false
          _.messageList.push({
            type: 'system',
            content: '⚙️ Reconnecting...'
          })
          _.reInitWebsocketInterval = setTimeout(function () {
            _.reInitSignal = true
            _.setKey()
          }, 2000)
        })
        
        ws.addEventListener('message', function (e) {
          let data = JSON.parse(e.data)
          if (data.clientID) {
            _.clientID = data.clientID
            updateRoom(
              _.getHash(),
              {
                clientID: data.clientID
              },
              function (err, res) {
                if (res) {
                  localStorage.setItem('hash', _.getHash())
                } else {
                  console.log(err, res)
                }
              }
            )
          }
          
          if (data.KEY) {
            _.friendOnline = true
            localStorage.setItem('theirKey', data.KEY)
            _.messageList.push({
              type: 'system',
              content: 'New Public Key Received'
            })
            _.scrollFunc()
          }
          
          if (data.ONLINE !== undefined) {
            _.checkFriendOnline(1)
          }
          
          if (data.type === 'out') {
            _.friendOnline = true
            if (data.password) {
              _.importKey('private', JSON.parse(localStorage.getItem('myPriKey')), function (priKey) {
                _.decrypt(priKey, data.password, function (err, password) {
                  let ciphertext = CryptoJS.Rabbit.decrypt(data.content, password)
                  data.content = ciphertext.toString(CryptoJS.enc.Utf8)
                  data.type = 'in'
                  _.messageList.push(data)
                  _.scrollFunc()
                })
              })
            } else {
              _.importKey('private', JSON.parse(localStorage.getItem('myPriKey')), function (priKey) {
                let chunks = []
                data.content.data.forEach((el, index) => {
                  _.decrypt(priKey, el.content, function (err, res) {
                    chunks.push(res)
                    data.type = 'in'
                    if (index + 1 === data.content.data.length) {
                      reformChunkAsString(chunks, function (err, res) {
                        data.content = res
                        _.messageList.push(data)
                        _.scrollFunc()
                      })
                    }
                  })
                })
              })
            }
          }
        })
      }
    },
    sendKey() {
      let _ = this
      _.ws.send(
        JSON.stringify({
          KEY: localStorage.getItem('myPubKey')
        })
      )
    },
    formMessage() {
      let _ = this
      document.getElementById('textArea').focus()
      splitAsChunk(150, _.userMessage, function (err, chunks, percent) {
        let chunkID = nanoid()
        let newChunkArr = []
        if (err) {
          console.log(err)
          return
        }
        if (!chunks) {
          _.fileSeparateProgress = percent
          return
        }
        let chunkTotal = 0
        chunks.forEach((el, index) => {
          let t = {}
          t.sequence = index
          t.content = el
          chunkTotal++
          
          newChunkArr.push(t)
        })
        
        let m = {
          content: {
            id: chunkID,
            total: chunkTotal,
            data: newChunkArr
          },
          old_message: _.userMessage,
          type: 'out',
          status: 0,
          hash: nanoid(),
          timestamp: Date.now()
        }
        _.scrollFunc()
        _.sendMessage(m)
      })
    },
    listenKey(e) {
      let _ = this
      if (e.key !== 'Enter') {
        return false
      }
      if (_.userIsComposting) {
        return false
      }
      
      e.preventDefault()
      
      if (_.imagePreview) {
        _.sendFile()
        return
      }
      
      if (_.userMessage) {
        _.formMessage()
      }
    }
  },
  data() {
    return {
      reInitWebsocketInterval: null,
      checkFriendOnlineBurst: 300,
      reInitSignal: false,
      textareaDisabled: false,
      userMessage: '',
      messageList: [],
      ws: null,
      my_key: '',
      their_key: '',
      clientID: '',
      fixHeight: 0,
      friendOnline: false,
      imagePreview: false,
      imagePreviewSrc: '',
      imagePreviewName: '',
      fileTypePreview: '',
      waitingForFile: false,
      fileSeparateProgress: 0,
      userIsComposting: false
    }
  },
  watch: {
    friendOnline(val) {
      if (val) {
        this.sendKey()
      }
    }
  }
}
</script>

<style scoped></style>
