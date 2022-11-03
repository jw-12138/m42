<template>
  <div class="app-wrap">
    <h1>M42</h1><br>
    <p>
      <code>{{ href }}/#/{{ token }}</code>
    </p><br>
    <p>
      Copy the link above to your friend. </p><br>
    <p>
      Reminder: Every generated URL can only be used once, meaning if you or someone else opened the link first, your friend will lose the access to the URL forever. </p>
    <br>
    <br>
    <button @click="enterRoom">I've sent it to my friend</button>
  </div>
</template>

<script>
export default {
  name: 'createRoom',
  mounted() {
    document.getElementById('app').classList.remove('chat')
  },
  computed: {
    href: function () {
      return location.origin
    }
  },
  methods: {
    enterRoom() {
      location.href = this.url
      this.$emit('enterRoom')
    }
  },
  props: {
    url: {
      type: String
    },
    token: {
      type: String
    }
  }
}
</script>