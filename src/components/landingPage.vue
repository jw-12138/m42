<template>
  <div class="app-wrap" v-show="pageLoaded" style="display: none">
    <h1>M42</h1><br>
    <p>
      Welcome! Click the button below to get started. </p><br>
    <br>
    <div>
      <button @click="createRoom">
        Create a Room
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import api from '../js/api.js'

export default {
  name: 'landingPage',
  data(){
    return {
      pageLoaded: false
    }
  },
  mounted() {
    this.pageLoaded = true
    document.getElementById('app').classList.remove('chat')
  },
  methods: {
    createRoom() {
      let _ = this
      axios
        .get(api.createRoom)
        .then((res) => {
        _.$emit('createRoom', res.data)
      }).catch(err => {
        console.log(err)
      })
      
    }
  }
}
</script>