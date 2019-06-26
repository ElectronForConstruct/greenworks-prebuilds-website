<template>
    <div class="home">
        <v-layout>
            <v-flex xs9>
                <v-select
                        :items="releaseTag"
                        label="Release"
                        v-model="selectedReleaseTag"
                ></v-select>
            </v-flex>
            <v-flex xs3>
                <v-btn @click="dl">{{ state }}</v-btn>
            </v-flex>
        </v-layout>
        <v-layout row wrap>
            <v-flex xs6 md4 lg3 v-for="asset in selectedReleaseAssets" :key="asset.id">
                <v-checkbox
                        v-model="selectedFiles"
                        :value="asset.id"
                        :label="asset.name | formatName"></v-checkbox>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
import ky from 'ky';
import { saveAs } from 'file-saver';
// (.*?)-(.*?)-(.*?)-(.*?)-(.*?)\.node

export default {
  name: 'home',
  filters: {
    formatName(value) {
      return value.replace(/(.*?)-(.*)-(v.*?)-(.*?)-(.*?)\.node/, '$2 $3 $4 $5');
    },
  },
  computed: {
    releaseTag() {
      return this.releases.map(r => r.tag_name);
    },
    selectedRelease() {
      return this.releases.find(r => r.tag_name === this.selectedReleaseTag);
    },
    selectedReleaseAssets() {
      if (this.selectedRelease) {
        return this.selectedRelease.assets;
      }
      return [];
    },
  },
  data() {
    return {
      state: 'Download',

      selectedReleaseTag: '',
      releases: [],
      selectedFiles: [],
    };
  },
  methods: {
    async dl() {
      this.state = 'Generating zip file';
      saveAs(`/.netlify/functions/downloadBundle?ids=${this.selectedFiles.join(',')}`, 'greenworks-binaries.zip');
      // saveAs(`http://localhost:9000/downloadBundle?ids=${this.selectedFiles.join(',')}`, 'greenworks-binaries.zip');
      this.state = 'Download';
    },
  },
  async mounted() {
    const rep = await ky
      .get('https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases')
      .json();
    console.log(rep);
    this.releases = rep;
    this.selectedReleaseTag = this.releases[0].tag_name;
  },
};
</script>
