<template>
  <v-app>
    <v-app-bar app fixed clipped-left persistant color="#151515">
      <v-toolbar-title class="headline text-uppercase d-flex align-center">
        <v-badge top right overlap class="mr-5 ma-4" v-model="showBadge">
          <template #badge>
            <v-tooltip open-on-hover bottom>
              <template #activator="{ on }">
                <span v-on="on">!</span>
              </template>
              <span>
                <v-icon>mdi-arrow-up</v-icon>Expand side bar to modify search filters
              </span>
            </v-tooltip>
          </template>
          <v-icon :ripple="false" :size="26" @click.stop="toggleDrawer">mdi-menu</v-icon>
        </v-badge>

        <!-- <v-tooltip
          open-delay="1000000"
          content-class="waving"
          nudge-bottom="5"
          v-model="showTooltip"
          bottom fixed
        >
          <template #activator="{ on }">
            <v-app-bar-nav-icon v-on="on" @click.stop="toggleDrawer"/>
          </template>
          <span>
            <v-icon>mdi-arrow-up</v-icon>
            Expand side bar to modify search filters
          </span>
        </v-tooltip>-->

        <v-img class="mx-3" width="45" :src="icons.homeIcon"></v-img>
        <a class="title" href="/">
          GREENWORKS PREBUILD - DOWNLOADER
          <v-chip class="ml-4">BETA</v-chip>
        </a>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text class="mr-2" href="https://armaldio.xyz/donations" target="_blank">
        <v-img width="25" text class="mr-3" :src="icons.donationIcon"></v-img>
        <span class="d-md-none d-lg-flex">Donations</span>
      </v-btn>
      <v-btn text class="mr-2" @click="shareModal = true">
        <v-icon left>mdi-share-outline</v-icon>
        <span class="d-md-none d-lg-flex">Share URL</span>
      </v-btn>
      <v-btn
        text
        href="https://github.com/ElectronForConstruct/greenworks-prebuilds-website"
        target="_blank"
      >
        <v-img width="25" text class="mr-3" :src="icons.githubIcon"></v-img>
        <span class="d-md-none d-lg-flex">Github</span>
      </v-btn>
      <v-btn text class="mr-2" target="_blank" href="https://github.com/ElectronForConstruct/greenworks-prebuilds/issues/new/choose">
        <v-icon left>mdi-bug</v-icon>
        <span class="d-md-none d-lg-flex">Bugs</span>
      </v-btn>
      <v-menu bottom left>
        <template #activator="{ on }">
          <v-avatar v-if="isLogged" size="40" class="ml-5 user-avatar" tile v-on="on">
            <img :src="user.avatar_url" :alt="user.login" />
          </v-avatar>
          <v-avatar v-else size="40" class="ml-5 user-avatar" tile v-on="on">
            <v-img :src="icons.guest"></v-img>
          </v-avatar>
        </template>

        <v-list>
          <v-list-item v-if="isLogged" disabled>
            <v-list-item-title>{{ user.email }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isLogged" @click="disconnect()">
            <v-list-item-title>
              <v-icon left>mdi-logout</v-icon>Disconnect
            </v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isLogged" target="_blank" @click="revoke">
            <v-list-item-title>
              <v-icon left>mdi-account-remove</v-icon>Revoke access
            </v-list-item-title>
          </v-list-item>
          <v-list-item v-else :href="loginUrl">
            <v-list-item-title>
              <v-icon left>mdi-login</v-icon>Login
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content>
      <v-container>
        <router-view />
      </v-container>
    </v-content>
    <v-snackbar v-model="snackbar" color="blue" bottom right :timeout="30000">
      {{ snackbarText }}
      <v-btn text @click="snackbar = false">Close</v-btn>
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
  mounted() {
    if (localStorage.getItem('tooltip')) {
      this.showBadge = localStorage.getItem('tooltip') === 'true';
    } else {
      this.showBadge = true;
    }

    if (localStorage.getItem('drawer')) {
      this.$store.commit(
        'SET_DRAWER',
        localStorage.getItem('drawer') === 'true',
      );
    }
  },
  computed: {
    isDev() {
      return process.env.NODE_ENV === 'development';
    },
    clientId() {
      return this.isDev ? 'e80afe92dc3477294936' : '8af5faeab9599fc013ed';
    },
    loginUrl() {
      return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&allow_signup=true`;
    },
    revokeUrl() {
      return `https://github.com/settings/connections/applications/${this.clientId}`;
    },
  },
  methods: {
    toggleDrawer() {
      this.$store.commit('SET_DRAWER', !this.$store.state.drawer);
      this.showBadge = false;
      localStorage.setItem('tooltip', 'false');
      localStorage.setItem('drawer', this.$store.state.drawer);
    },
    revoke() {
      this.disconnect();
      window.open(this.revokeUrl, '_blank');
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
      showBadge: false,
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

.user-avatar .v-image,
.user-avatar img {
  border-radius: 3px !important;
}

.user-avatar .v-image:hover,
.user-avatar img:hover {
  opacity: 0.8;
}

.waving {
  animation: upDown 0.5s alternate infinite ease-in-out;
}

@keyframes upDown {
  to {
    transform: translatey(3px);
  }
}
</style>
