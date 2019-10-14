<template>
  <div class="gh-callback">
    {{ code }}
  </div>
</template>

<script>
import ky from 'ky';

export default {
  name: 'home',
  data() {
    return {
      code: '',
    };
  },
  async mounted() {
    this.code = this.$route.query.code;
    const resp = await ky.get(`/.netlify/functions/getToken?code=${this.code}`).json();
    localStorage.setItem('token', resp.access_token);
  },
};
</script>

<style lang="scss">

</style>
