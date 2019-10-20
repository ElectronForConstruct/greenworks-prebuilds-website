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
        <v-list-item
          @click="() => {}"
          v-for="v in version.slice(0, maxVersionsShown)"
          :key="v.name"
        >
          <v-list-item-action>
            <v-checkbox v-model="v.value"></v-checkbox>
          </v-list-item-action>

          <v-list-item-content @click="v.value = !v.value">
            <v-list-item-title>
              {{ v.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="maxVersionsShown < version.length"
          @click="maxVersionsShown = version.length"
        >
          <v-list-item-content>
            <v-list-item-title>
              Show more
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

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
        <v-data-table
          v-model="selectedFiles"
          :headers="headers"
          :items="filteredReleaseAssets()"
          item-key="name"
          show-select
          class="elevation-1"
          search
          :loading="isLoading"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-spacer></v-spacer>
              <v-btn
                :disabled="selectedFiles.length === 0 || loadingDialog === true"
                @click="dl">
                <v-icon left>mdi-folder-zip-outline</v-icon>
                Download {{ selectedFiles.length }} file{{ selectedFiles.length > 1 ? 's' : '' }}
                {{ selectedFiles.length > 0
                ? `(${
                Math.round(
                  (selectedFiles.reduce((prev, curr) => prev + curr.size, 0) / 1049000) * 100) / 100 // 1049000 bytes to mib
                }MB)`
                : '' }}
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:item.abi="{ item }">
            <v-chip class="ma-1" color="green" label>{{ item.abi }}</v-chip>
          </template>
          <template v-slot:item.os="{ item }">
            <v-chip class="ma-1" color="purple" label>{{ item.os }}</v-chip>
          </template>
          <template v-slot:item.runtime="{ item }">
            <v-chip class="ma-1" color="red" label>{{ item.runtime }}</v-chip>
          </template>
          <template v-slot:item.size="{ item }">
            <v-chip class="ma-1" label>{{ Math.round(item.size/1049000*100)/100 }} MB</v-chip>
          </template>
          <template v-slot:item.arch="{ item }">
            <v-chip v-if="item.arch === 'x64'" class="ma-1" color="grey" label>64 bits</v-chip>
            <v-chip v-else-if="item.arch === 'ia32'" class="ma-1" color="grey" label>32 bits
            </v-chip>
            <v-chip v-else class="ma-1" color="grey" label>{{ item.arch }}</v-chip>
          </template>
        </v-data-table>
      </v-col>

      <v-dialog v-model="loadingDialog" width="500" persistent>
        <v-card>
          <v-card-text>
            Preparing your files...
            <v-progress-linear
              :indeterminate="downloadProgress === -1"
              :value="downloadProgress"
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
          <v-card-actions>
            <v-btn :disabled="downloadProgress === -1" @click="loadingDialog = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showLoginModal" width="500" persistent>
        <v-card>
          <v-card-title class="headline">Warning</v-card-title>
          <v-card-text>
            Please <a :href="loginUrl()">login to GitHub</a> to enable file downloading!
            (This is required in order to avoid download traffic limits.)
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="showLoginModal = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import { saveAs } from 'file-saver';
import axios from 'axios';
import semver from 'semver';
import abis from 'modules-abi';

// const sleep = m => new Promise(r => setTimeout(r, m));

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
  components: {},
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
    selectedRelease() {
      return this.releases.find(r => r === this.selectedReleaseTag);
    },
  },
  data() {
    return {
      maxVersionsShown: 5,
      selectedFiles: [],
      downloadProgress: -1,
      search: '',
      loadingDialog: false,
      isLoading: true,
      showLoginModal: false,
      selected: [],
      iconSet: {
        darwin: {
          icon: 'mdi-apple',
          name: 'Mac',
        },
        win32: {
          icon: 'mdi-windows',
          name: 'Windows',
        },
        linux: {
          icon: 'mdi-linux',
          name: 'Linux',
        },
        nodejs: {
          icon: 'mdi-nodejs',
          name: 'Node.js',
        },
        electron: {
          icon: 'mdi-electron',
          name: 'Electron',
        },
        'nw.js': {
          icon: 'mdi-compass',
          name: 'NW.js',
        },
      },
      headers: [
        {
          text: 'ABI',
          value: 'abi',
        },
        {
          text: 'Architecture',
          value: 'arch',
        },
        {
          text: 'OS',
          value: 'os',
        },
        {
          text: 'Runtime',
          value: 'runtime',
        },
        {
          text: 'Size',
          value: 'size',
        },
        {
          text: 'Last update',
          value: 'updated_at',
        },
      ],
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
      runtime: [],
      version: [],

      selectedReleaseTag: null,
      releases: [],
    };
  },
  methods: {
    loginUrl() {
      const isDev = process.env.NODE_ENV === 'development';
      return `https://github.com/login/oauth/authorize?client_id=${
        isDev
          ? 'e80afe92dc3477294936'
          : '8af5faeab9599fc013ed'
      }&allow_signup=true`;
    },
    filteredReleaseAssets() {
      if (this.selectedRelease) {
        console.time('filteredReleaseAssets');
        const assets = [];
        for (let i = 0; i < this.selectedRelease.assets.length; i += 1) {
          const asset = this.selectedRelease.assets[i];
          // eslint-disable-next-line
            assets.push(mapped(asset));
        }
        const ret = assets
          .filter(this.filterOs)
          .filter(this.filterArch)
          .filter(this.filterRuntime)
          .filter(this.filterVersion)
          .reverse();
        console.timeEnd('filteredReleaseAssets');
        console.log(ret);
        this.isLoading = false;
        return ret;
      }
      this.isLoading = false;
      return [];
    },
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
      const token = localStorage.getItem('token');
      console.log('my token', token);
      if (!token || token === 'undefined') {
        this.showLoginModal = true;
        return;
      }


      this.loadingDialog = true;

      console.log(this.selectedFiles);


      const url = `/.netlify/functions/downloadBundle?ids=${this.selectedFiles.map(file => file.id)
        .join(',')}&token=${token}`;
      console.log(url);

      try {
        const { data } = await axios.get(url, {
          responseType: 'blob',
          onDownloadProgress(progress) {
            console.log(progress);
            this.downloadProgress = progress.loaded / (
              this.selectedFiles.reduce((prev, curr) => prev + curr.size, 0)
            );
          },
        });

        saveAs(data, 'greenworks-binaries.zip');
        this.loadingDialog = false;
      } catch (e) {
        console.log('Error downloading bundle', e);
        this.loadingDialog = false;
      }
    },
  },
  async mounted() {
    const uniq = (arr, key) => Array.from(new Set(arr.map(a => a[key])))
      .map(id => arr.find(a => a[key] === id));
    const toTitleCase = s => s.substr(0, 1)
      .toUpperCase() + s.substr(1)
      .toLowerCase();

    const _allReleases = await abis.getAll();
    const allReleases = _allReleases.filter(release => release.abi >= 57);

    this.version = uniq(allReleases, 'abi')
      .map(el => el.abi)
      .sort((a, b) => b - a) // descending, high on top
      .map(el => ({
        name: el.toString(),
        value: true,
      }));

    this.runtime = uniq(allReleases, 'runtime')
      .map(el => ({
        name: toTitleCase(el.runtime.toString()),
        id: el.runtime.toString(),
        value: true,
      }));

    const rep = await axios
      .get('https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases', {
        headers: {
          Authorization: `token ${'49f5687fc74189014c37fedce2fc2d85dda344f1'}`,
        },
      });

    this.releases = rep.data.filter(r => semver.gte(r.tag_name, '0.2.6'));
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
    }
  }

  .centered-progress {
    width: 100%;
    margin: 20px;
  }

  .sortable i {
    margin-left: 10px;
  }

  .sortable span {
    vertical-align: middle;
  }

  .v-data-footer__icons-after {
    margin-right: 10px;
  }

</style>
