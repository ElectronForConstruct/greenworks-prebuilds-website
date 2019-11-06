<template>
  <v-app>
    <v-app-bar app fixed clipped-left persistant color="#151515">
      <v-toolbar-title class="headline text-uppercase d-flex align-center">
        <v-img class="mr-3" width="45" :src="icons.homeIcon"></v-img>
        <a class="title" href="/">
          GREENWORKS PREBUILD - DOWNLOADER
          <v-chip class="ml-4">BETA</v-chip>
        </a>
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
      <v-menu bottom left>
        <template v-slot:activator="{ on }">
          <v-avatar v-if="isLogged" size="40" class="ml-5 user-avatar" tile v-on="on">
            <img
              :src="user.avatar_url"
              :alt="user.login"
            >
          </v-avatar>
          <v-avatar v-else size="40" class="ml-5 user-avatar" tile v-on="on">
            <v-img :src="icons.guest"></v-img>
          </v-avatar>
        </template>

        <v-list>
          <v-list-item
            v-if="isLogged"
            disabled
          >
            <v-list-item-title>
              {{ user.email }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="isLogged"
            @click="disconnect()"
          >
            <v-list-item-title>
              <v-icon left>mdi-logout</v-icon>
              Disconnect
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-else
            :href="loginUrl()"
          >
            <v-list-item-title>
              <v-icon left>mdi-login</v-icon>
              Login
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
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
      :timeout="30000"
    >
      {{ snackbarText }}
      <v-btn
        text
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </v-snackbar>

  </v-app>
</template>

<script>
import ky from 'ky';
import homeIcon from './assets/home.png';
import donationIcon from './assets/donation.png';
import githubIcon from './assets/github.png';
import guest from './assets/githubguest.png';


export default {
  name: 'App',
  methods: {
    loginUrl() {
      const isDev = process.env.NODE_ENV === 'development';
      return `https://github.com/login/oauth/authorize?client_id=${
        isDev
          ? 'e80afe92dc3477294936'
          : '8af5faeab9599fc013ed'
      }&allow_signup=true`;
    },
    disconnect() {
      localStorage.removeItem('token');
      this.isLogged = false;
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler() {
        const token = localStorage.getItem('token');
        this.isLogged = !!token;
        if (this.isLogged) {
          const resp = await ky
            .get('https://api.github.com/user', {
              headers: {
                Authorization: `token ${token}`,
                'User-Agent': 'Greenworks Prebuilds Downloader',
              },
            })
            .json();
          if (resp.login) {
            this.user = resp;
          }
        }
      },
    },
  },
  data() {
    return {
      user: {},
      snackbar: false,
      snackbarText: '',
      isLogged: false,

      releases: [],
      selectedReleaseTag: null,
      icons: {
        homeIcon,
        donationIcon,
        githubIcon,
        guest,
      },
    };
  },
};
</script>

<style lang="scss">
  .title {
    color: white !important;
    text-decoration: none;
  }

  .user-avatar {
    cursor: pointer;
  }

  .user-avatar .v-image, .user-avatar img {
    border-radius: 3px !important;
  }

  .user-avatar .v-image:hover, .user-avatar img:hover {
    opacity: .8;
  }
</style>
