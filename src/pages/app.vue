<template>
  <landing-page v-if="showLandingPage" @createRoom="createRoom"></landing-page>
  <create-room v-if="showCreateRoom" :token="token_b" :url="baseUrl + token_a" @enterRoom="enterRoom"></create-room>
  <chat-page v-if="showChat"></chat-page>
</template>

<script>
import LandingPage from '../components/landingPage.vue'
import CreateRoom from '../components/createRoom.vue'
import chatPage from '../components/chatPage.vue'
import {checkHash} from '../js/utils.js'
import axios from 'axios'
import api from '../js/api.js'

export default {
  computed: {
    baseUrl: function () {
      return location.origin + '/#/'
    }
  },
  mounted() {
    let _ = this
    if (location.hash) {
      _.checkRoom()
    }
  },
  data() {
    return {
      showLandingPage: true,
      showCreateRoom: false,
      showChat: false,
      token_a: '',
      token_b: ''
    }
  },
  components: {CreateRoom, LandingPage, chatPage},
  methods: {
    checkHash,
    checkRoom() {
      let _ = this
      this.checkHash(function (err, res) {
        if (err) {
          console.log(err)
          return
        }
        
        if (res.data.hasToken) {
          _.showLandingPage = false
          _.showCreateRoom = false
          _.showChat = true
        } else {
          location.href = location.origin
        }
        
        if(res.data.roomID){
          localStorage.setItem('roomID', res.data.roomID)
        }
      })
    },
    enterRoom() {
      this.checkRoom(function () {
        axios.get(api.updateRoom, {
          id: location.hash.replace('#/', ''),
          status: 1
        })
      })
    },
    createRoom(data) {
      this.showLandingPage = false
      this.showCreateRoom = true
      this.token_b = data.token_b
      this.token_a = data.token_a
    }
  }
}
</script>