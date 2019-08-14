<template>
  <div class="home">
    <v-navigation-drawer clipped fixed app permanent :width="250">
      <v-list dense>
        <v-subheader>Release Tag</v-subheader>

        <v-radio-group v-model="selectedReleaseTag"
                       mandatory
                       class="full-width"
                       v-if="releases.length > 0">
          <v-list-item @click="() => {}"
                       v-for="release in releases"
                       :key="release.tag_name">
            <v-list-item-action>
              <v-radio :value="release"></v-radio>
            </v-list-item-action>

            <v-list-item-content @click="selectedReleaseTag = release">
              <v-list-item-title>
                {{ release.tag_name }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-radio-group>
        <v-list-item @click="() => {}"
                     v-else>
          <v-list-item-content>
            <v-list-item-title>
              Loading releases...
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-subheader>OS</v-subheader>
        <v-list-item @click="() => {}" v-for="o in os" :key="o.name">
          <v-list-item-action>
            <v-checkbox v-model="o.value"></v-checkbox>
          </v-list-item-action>

          <v-list-item-content @click="o.value = !o.value">
            <v-list-item-title>
              {{ o.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-subheader>Arch</v-subheader>
        <v-list-item @click="() => {}" v-for="a in arch" :key="a.name">
          <v-list-item-action>
            <v-checkbox v-model="a.value"></v-checkbox>
          </v-list-item-action>

          <v-list-item-content @click="a.value = !a.value">
            <v-list-item-title>
              {{ a.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-subheader>Runtime</v-subheader>
        <v-list-item @click="() => {}" v-for="r in runtime" :key="r.name">
          <v-list-item-action>
            <v-checkbox v-model="r.value"></v-checkbox>
          </v-list-item-action>

          <v-list-item-content @click="r.value = !r.value">
            <v-list-item-title>
              {{ r.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-subheader>Versions</v-subheader>
        <v-list-item @click="() => {}" v-for="v in version" :key="v.name">
          <v-list-item-action>
            <v-checkbox v-model="v.value"></v-checkbox>
          </v-list-item-action>

          <v-list-item-content @click="v.value = !v.value">
            <v-list-item-title>
              {{ v.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-btn
      fixed
      bottom
      right
      fab
      :disabled="selectedFiles.length === 0 || loadingDialog === true"
      @click="dl">
      <v-icon>fas fa-download</v-icon>
    </v-btn>

    <v-row>
      <v-col cols="12" class="pb-2">
        <!--<v-text-field
          v-model="search"
          append-icon="fas fa-search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>-->
      </v-col>
      <v-col cols="12">
        <v-list v-if="selectedFiles.length > 0">
          <transition-group name="slide-x-transition">
            <version-line
              v-for="asset in selectedFiles"
              :key="asset.id"
              :infos="asset"></version-line>
          </transition-group>
        </v-list>
        <hr v-if="selectedFiles.length > 0">
        <v-list :items="filteredReleaseAssets"
                v-if="filteredReleaseAssets">
          <v-progress-circular
            class="centered-progress"
            v-if="filteredReleaseAssets.length === 0"
            indeterminate
            color="primary"
          ></v-progress-circular>
          <transition-group name="slide-x-transition">
            <version-line
              v-for="asset in filteredReleaseAssets"
              :key="asset.id"
              :infos="asset"></version-line>
          </transition-group>
        </v-list>
      </v-col>

      <v-dialog v-model="loadingDialog" width="500" persistent>
        <v-card>
          <v-card-text>
            Preparing your files...
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import { saveAs } from 'file-saver';
import ky from 'ky';
import semver from 'semver';
import versionLine from '../components/VersionLine.vue';

const sleep = m => new Promise(r => setTimeout(r, m));

const mapped = (asset) => {
  const arr = asset.name.split(/(.*?)-(.*)-(v.*?)-(.*?)-(.*?)\.node/);
  return Object.assign({}, asset, {
    runtime: arr[2],
    abi: arr[3],
    os: arr[4],
    arch: arr[5],
  });
};

export default {
  name: 'home',
  components: { versionLine },
  filters: {
    formatName(value) {
      return value.replace(/(.*?)-(.*)-(v.*?)-(.*?)-(.*?)\.node/, '$2 $3 $4 $5');
    },
  },
  watch: {
    os: {
      handler(newValue) {
        const oses = newValue.map(x => (x.value ? x.id : null))
          .filter(x => !!x)
          .join(',');
        console.log(oses);

        this.$router.push({
          name: this.$router.fullPath,
          query: Object.assign({}, this.$route.query, { os: oses }),
        });
      },
      deep: true,
    },
    arch: {
      handler(newValue) {
        console.log(this.$route.query);
        const arches = newValue.map(x => (x.value ? x.id : null))
          .filter(x => !!x)
          .join(',');

        this.$router.push({
          name: this.$router.fullPath,
          query: Object.assign({}, this.$route.query, { arch: arches }),
        });
      },
      deep: true,
    },
    runtime: {
      handler(newValue) {
        console.log(this.$route.query);
        const runtimes = newValue.map(x => (x.value ? x.id : null))
          .filter(x => !!x)
          .join(',');

        this.$router.push({
          name: this.$router.fullPath,
          query: Object.assign({}, this.$route.query, { runtime: runtimes }),
        });
      },
      deep: true,
    },
    version: {
      handler(newValue) {
        console.log(this.$route.query);
        const versions = newValue.map(x => (x.value ? x.name : null))
          .filter(x => !!x)
          .join(',');

        this.$router.push({
          name: this.$router.fullPath,
          query: Object.assign({}, this.$route.query, { version: versions }),
        });
      },
      deep: true,
    },
  },
  computed: {
    filteredReleaseAssets() {
      if (this.selectedRelease) {
        const assets = [];
        for (let i = 0; i < this.selectedRelease.assets.length; i += 1) {
          const asset = this.selectedRelease.assets[i];
          // eslint-disable-next-line
            assets.push(mapped(asset));
        }
        return assets
          .filter(this.filterOs)
          .filter(this.filterArch)
          .filter(this.filterRuntime)
          .filter(this.filterVersion)
          .reverse();
      }
      return [];
    },
    selectedRelease() {
      return this.releases.find(r => r === this.selectedReleaseTag);
    },
    selectedFiles() {
      return this.$store.state.selected;
    },
  },
  data() {
    return {
      search: '',
      loadingDialog: false,
      os: [
        {
          name: 'Mac',
          id: 'darwin',
          value: true,
        },
        {
          name: 'Windows',
          id: 'win32',
          value: true,
        },
        {
          name: 'Linux',
          id: 'linux',
          value: true,
        },
      ],
      arch: [
        {
          name: '64 bits',
          id: 'x64',
          value: true,
        },
        {
          name: '32 bits',
          id: 'ia32',
          value: true,
        },
      ],
      runtime: [
        {
          name: 'Electron',
          id: 'electron',
          value: true,
        },
        {
          name: 'NW.js',
          id: 'nw.js',
          value: true,
        },
        {
          name: 'Node',
          id: 'node',
          value: true,
        },
      ],
      version: [
        {
          name: '57',
          value: true,
        },
        {
          name: '59',
          value: true,
        },
        {
          name: '64',
          value: true,
        },
        {
          name: '67',
          value: true,
        },
        {
          name: '69',
          value: true,
        },
        {
          name: '70',
          value: true,
        },
        {
          name: '72',
          value: true,
        },
      ],

      selectedReleaseTag: null,
      releases: [],
    };
  },
  methods: {
    filterOs(asset) {
      if (this.$route.query.os && this.$route.query.os.length > 0) {
        const osFilter = this.$route.query.os.split(',');
        return osFilter.includes(asset.os);
      }
      return true;
    },
    filterArch(asset) {
      if (this.$route.query.arch && this.$route.query.arch.length > 0) {
        const archFilter = this.$route.query.arch.split(',');
        return archFilter.includes(asset.arch);
      }
      return true;
    },
    filterRuntime(asset) {
      if (this.$route.query.runtime && this.$route.query.runtime.length > 0) {
        const runtimeFilter = this.$route.query.runtime.split(',');
        return runtimeFilter.includes(asset.runtime);
      }
      return true;
    },
    filterVersion(asset) {
      if (this.$route.query.version && this.$route.query.version.length > 0) {
        const versionFilter = this.$route.query.version.split(',');
        return versionFilter.includes(asset.abi.replace('v', ''));
      }
      return true;
    },
    async dl() {
      this.loadingDialog = true;
      console.log('ok');
      await sleep(1000);
      console.log('ok');

      this.selectedFiles.map(file => file.id)
        .join(',');

      saveAs(`/.netlify/functions/downloadBundle?ids=${this.selectedFiles.map(file => file.id)
        .join(',')}`, 'greenworks-binaries.zip');


      this.loadingDialog = false;
    },
  },
  async mounted() {
    const rep = await ky
      .get('https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases')
      .json();

    this.releases = rep.filter(r => semver.gte(r.tag_name, '0.2.6'));
    this.selectedReleaseTag = this.releases[0];

    const filters = ['os', 'arch', 'runtime', 'version'];
    filters.forEach((filter) => {
      if (this.$route.query[filter] && this.$route.query[filter].length > 0) {
        const URLFilters = this.$route.query[filter].split(',');
        this[filter].forEach((el) => {
          // eslint-disable-next-line
            el.value = URLFilters.includes(el.id ? el.id : el.name);
        });
      }
    });
  },
};
</script>

<style lang="scss">
  .full-width {
    margin-top: 0 !important;

    > div {
      width: 100% !important;
    }
  }

  th {
    > i {
      vertical-align: middle;
      margin-right: 10px;
    }
  }

  .centered-progress {
    width: 100%;
    margin: 20px;
  }

</style>
