<template>
  <div class="gh-callback-view">
    <div v-if="isLoading">
      <v-progress-circular
        indeterminate
        color="primary"
      >
      </v-progress-circular>
    </div>
    <div v-else>
      <div v-if="isOk" class="isOk">
        <div>
          <v-icon class="mb-5" :size="48" color="success">fas fa-check-circle</v-icon>
          You're all set!
        </div>
        <div>
          You can go back to the homepage
        </div>
        <v-btn to="/">Back</v-btn>
      </div>
      <div v-else>
        <v-icon class="mb-5" :size="48" color="warning">fas fa-exclamation-triangle</v-icon>
        <p>There was an error!</p>
        <p>Try again later</p>
      </div>
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
      isLoading: true,
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
    this.isLoading = false;
  },
};
</script>

<style lang="scss">
  .gh-callback-view {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    text-align: center;
  }
</style>
