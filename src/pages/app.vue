<template>
  <landing-page v-if="showLandingPage" @createRoom="createRoom" @enterRoom="enterRoom" ></landing-page>
  <create-room v-if="showCreateRoom" :token="token_b" :url="baseUrl + token_a"></create-room>
  <chat-page v-if="showChat"></chat-page>
</template>

<script>
import LandingPage from '../components/landingPage.vue'
import CreateRoom from '../components/createRoom.vue'
import chatPage from '../components/chatPage.vue'

export default {
  mounted() {
    if(location.hash){
      // TODO: verify if there is actually a room for current user
    }
  },
  data() {
    return {
      showLandingPage: true,
      showCreateRoom: false,
      showEnterRoom: false,
      showChat: false,
      token_a: '',
      token_b: '',
      baseUrl: 'http://localhost:5173/#/'
    }
  },
  components: {EnterRoom, CreateRoom, LandingPage, chatPage},
  methods: {
    createRoom(data) {
      this.showLandingPage = false
      this.showCreateRoom = true
      this.token_b = data.token_b
      this.token_a = data.token_a
    },
    enterRoom() {
      this.showLandingPage = false
      this.showEnterRoom = true
    }
  }
}
</script>