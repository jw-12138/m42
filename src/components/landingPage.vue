<template>
  <div class="app-wrap" v-show="pageLoaded" style="display: none">
    <h1>M42 🥳</h1>
    <br />
    <p>Welcome! Click the button below to get started.</p>
    <br />
    <br />
    <div>
      <button @click="createRoom">Create a Room</button>
    </div>
    <br />
    <br />
    <h2>What is it? 🧐</h2>
    <div>
      <p>M42 (message for two) is an Instant Messaging App, it has the following features:</p>
      <ul>
        <li>✨ <a href="https://github.com/jw-12138/m42">open source</a> <img src="../img/github-mark-white.png" alt="" style="width: 14px; height: 14px; display: inline-block; position: relative; top: 2px;"></li>
        <li>🔐 end-to-end encryption</li>
        <li>☝️ no group chat, 1-on-1 only</li>
        <li>😎 no chat history stored</li>
        <li>🫣 no login needed</li>
        <li>🫡 1-end session</li>
        <li>☠️ self-destroy room when no activity</li>
      </ul>
      <br />
      Note that this is a personal project, and there is no absolute safety when it comes to online service, so use it
      at your own risk!

      <br />
      <br />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import api from '../js/api.js'

export default {
  name: 'landingPage',
  data() {
    return {
      pageLoaded: false
    }
  },
  mounted() {
    this.pageLoaded = true
    localStorage.removeItem('myPubKey')
    localStorage.removeItem('myPriKey')
  },
  methods: {
    createRoom() {
      let _ = this
      axios
        .get(api.createRoom)
        .then((res) => {
          _.$emit('createRoom', res.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
}
</script>
