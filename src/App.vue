<template>
  <v-app dark>
    <v-toolbar app fixed clipped-left persistant>
      <v-toolbar-title class="headline text-uppercase d-flex align-center">
        <v-img class="mr-3" width="45" :src="icons.homeIcon"></v-img>
        <span>Greenworks Prebuild Downloader</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn>
        <v-img width="25" flat class="mr-3" :src="icons.donationIcon"></v-img>
        Donations
      </v-btn>
      <v-btn>
        <v-img width="25" flat class="mr-3" :src="icons.githubIcon"></v-img>
        Github
      </v-btn>
    </v-toolbar>

    <v-content>
      <v-container>
        <router-view/>
      </v-container>
    </v-content>

    <v-snackbar v-model="snackbar"
                color="blue"
                bottom
                right
                :timeout="30000">
      {{ snackbarText }}
      <v-btn flat
             @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
// import install from './registerServiceWorker';
import homeIcon from './assets/home.png';
import donationIcon from './assets/donation.png';
import githubIcon from './assets/github.png';

export default {
  name: 'App',
  data() {
    return {
      snackbar: false,
      snackbarText: '',

      releases: [],
      selectedReleaseTag: null,
      icons: {
        homeIcon,
        donationIcon,
        githubIcon,
      },
    };
  },
  async mounted() {
    /* install((text) => {
                this.snackbar = true;
                this.snackbarText = text;
              }); */
  },
};
</script>

<style>

</style>
