<template>
    <v-app dark>
        <v-toolbar app>
            <v-toolbar-title class="headline text-uppercase">
                <span>Greenworks Prebuild Downloader</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <!--<v-btn
                    flat
                    href="https://github.com/vuetifyjs/vuetify/releases/latest"
                    target="_blank"
            >
                <span class="mr-2">Latest Release</span>
                <v-icon>fas fa-external-link-alt</v-icon>
            </v-btn>-->
        </v-toolbar>

        <v-content>
            <v-container>
                <router-view/>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      //
    };
  },
};
</script>
