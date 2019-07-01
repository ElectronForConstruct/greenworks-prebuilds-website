<template>
    <v-app dark>
        <v-toolbar app fixed clipped-left persistant>
            <v-toolbar-title class="headline text-uppercase">
                <span>Greenworks Prebuild Downloader</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <!--
                <v-btn flat
                       href="https://github.com/vuetifyjs/vuetify/releases/latest"
                       target="_blank">
                    <span class="mr-2">Latest Release</span>
                    <v-icon>fas fa-external-link-alt</v-icon>
                </v-btn>
            -->
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
import install from './registerServiceWorker';

export default {
  name: 'App',
  data() {
    return {
      snackbar: false,
      snackbarText: '',

      releases: [],
      selectedReleaseTag: null,
    };
  },
  async mounted() {
    install((text) => {
      this.snackbar = true;
      this.snackbarText = text;
    });
  },
};
</script>

<style>

</style>
