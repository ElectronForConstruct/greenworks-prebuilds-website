<template>
  <div>
    <div v-if="isOk" class="isOk">
      <div>
        You're all set!
      </div>
      <div>
        You can go back to the homepage
      </div>
      <v-btn to="/">Back</v-btn>
    </div>
    <div v-else>
      There was an error!
      Try again later
    </div>
  </div>
</template>

<script>
import ky from 'ky';

export default {
  name: 'home',
  data() {
    return {
      code: '',
      isOk: false,
    };
  },
  async mounted() {
    this.code = this.$route.query.code;
    const resp = await ky
      .get(`/.netlify/functions/getToken?code=${this.code}`)
      .json();
    localStorage.setItem('token', resp.access_token);
    if (resp.access_token) {
      this.isOk = true;
    }
  },
};
</script>

<style lang="scss">

</style>
