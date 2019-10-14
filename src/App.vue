<template>
  <v-app>
    <v-app-bar app fixed clipped-left persistant>
      <v-toolbar-title class="headline text-uppercase d-flex align-center">
        <v-img class="mr-3" width="45" :src="icons.homeIcon"></v-img>
        <span>GREENWORKS PREBUILD - DOWNLOADER</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text class="mr-2" href="https://armaldio.xyz/donations" target="_blank">
        <v-img width="25" text class="mr-3" :src="icons.donationIcon"></v-img>
        Donations
      </v-btn>
      <v-btn text href="https://github.com/ElectronForConstruct/greenworks-prebuilds-website"
             target="_blank">
        <v-img width="25" text class="mr-3" :src="icons.githubIcon"></v-img>
        Github
      </v-btn>
      <v-avatar>
        <a :href="loginUrl()">Login</a>
      </v-avatar>
    </v-app-bar>

    <v-content>
      <v-container>
        <router-view/>
      </v-container>
    </v-content>
    <v-snackbar
      v-model="snackbar"
      color="blue"
      bottom
      right
      :timeout="30000">
      {{ snackbarText }}
      <v-btn text
             @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>

  </v-app>
</template>

<script>
import homeIcon from './assets/home.png';
import donationIcon from './assets/donation.png';
import githubIcon from './assets/github.png';

export default {
  name: 'App',
  methods: {
    loginUrl() {
      const isDev = process.env.NODE_ENV === 'development';
      console.log('isDev', isDev);
      return `https://github.com/login/oauth/authorize?client_id=${isDev ? 'e80afe92dc3477294936' : '8af5faeab9599fc013ed'}&allow_signup=true`;
    },
  },
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
};
</script>
