<template>
  <div class="home">
    <v-navigation-drawer clipped fixed app permanent :width="250">
      <v-list dense>
        <v-list-item-content>
          <v-select
            :loading="releases.length === 0"
            return-object
            class="mx-2"
            :items="releases"
            v-model="selectedReleaseTag"
            item-text="tag_name"
            label="Release Tag"
          ></v-select>
        </v-list-item-content>

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

      <!-- Here -->
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
              <v-btn class="mr-2" @click="shareModal = true">
                <v-icon left>mdi-share-outline</v-icon>
                Share URL
              </v-btn>
              <v-btn
                :disabled="selectedFiles.length === 0 || loadingDialog === true"
                @click="dl">
                <v-icon left>mdi-folder-zip-outline</v-icon>
                Download {{ selectedFiles.length }} file{{ selectedFiles.length > 1 ? 's' : '' }}
                {{ selectedFiles.length > 0 ? `(${calculateTotalSize}MB)`
                : '' }}
              </v-btn>
              <!-- 1049000 bytes to mib -->
            </v-toolbar>
          </template>
          <template v-slot:item.os="{ item }">
            <v-chip class="ma-1" color="purple" label>
              <v-icon left>{{ iconSet[item.os].icon }}</v-icon>
              {{ iconSet[item.os].name }}
            </v-chip>
          </template>
          <template v-slot:item.runtime="{ item }">
            <v-chip class="ma-1" color="red" label>
              <v-icon left>{{ iconSet[item.runtime].icon }}</v-icon>
              {{ iconSet[item.runtime].name }}
            </v-chip>
          </template>
          <template v-slot:item.size="{ item }">
            <v-chip class="ma-1" label>{{ Math.round(item.size/1049000*100)/100 }} MB</v-chip>
          </template>
          <template v-slot:item.arch="{ item }">
            <v-chip class="ma-1" color="grey" label>
              <v-icon left>{{ iconSet[item.arch].icon }}</v-icon>
              {{ iconSet[item.arch].name }}
            </v-chip>
          </template>
          <template v-slot:item.updated_at="{ item }">
            {{ new Date(item.updated_at).toLocaleString() }}
          </template>
          <template v-slot:item.range="{ item }">
            <Range :infos="item"></Range>
          </template>
        </v-data-table>
      </v-col>

      <v-dialog v-model="loadingDialog" width="500" persistent>
        <v-card>
          <v-card-text class="text-center">
            <div class="py-2">Preparing your files...</div>
            <v-progress-linear
              :indeterminate="downloadProgress === -1"
              :value="downloadProgress"
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showLoginModal" width="500" persistent>
        <v-card>
          <v-card-title class="headline">Download Info</v-card-title>
          <v-card-text>
            <span>
              Please <a :href="loginUrl()">login to GitHub</a> to enable file downloading!
            </span>
            <br>
            <span>(Required in order to avoid download traffic limits.)</span>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="showLoginModal = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="shareModal" width="500" persistent>
        <v-card>
          <v-card-title class="headline">URL sharing</v-card-title>
          <v-card-text>
            <p>You can share this URL to link directly to filtered assets</p>
            <v-text-field
              readonly
              :value="shareURL()"
              label="URL"
              type="text"
            ></v-text-field>
            <v-text-field
              readonly
              :value="shortenedURL"
              label="Shortened URL"
              type="text"
            >
            </v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-if="shortenedURL"
              @click="copyToClipboard(shortenedURL)">
              Copy short URL
            </v-btn>
            <v-btn
              v-else
              :loading="generatingURL"
              @click="generateShortURL()">
              Generate short URL
            </v-btn>
            <v-btn @click="copyToClipboard(shareURL())">Copy URL</v-btn>
            <v-btn @click="shareModal = false">OK</v-btn>
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

import Range from '../components/Range.vue';

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
  components: {
    Range,
  },
  filters: {
    formatName(value) {
      return value.replace(/(.*?)-(.*)-(v.*?)-(.*?)-(.*?)\.node/, '$2 $3 $4 $5');
    },
  },
  computed: {
    selectedRelease() {
      return this.releases.find(r => r === this.selectedReleaseTag);
    },
    calculateTotalSize() {
      return Math.round(
        (
          this.selectedFiles.reduce((prev, curr) => prev + curr.size, 0) / 1049000
        ) * 100,
      ) / 100;
    },
  },
  data() {
    return {
      generatingURL: false,
      shortenedURL: '',
      maxVersionsShown: 5,
      selectedFiles: [],
      downloadProgress: -1,
      shareModal: false,
      search: '',
      loadingDialog: false,
      isLoading: true,
      showLoginModal: false,
      selected: [],
      iconSet: {
        ia32: {
          icon: 'mdi-cpu-32-bit',
          name: '32 bits',
        },
        x64: {
          icon: 'mdi-cpu-64-bit',
          name: '64 bits',
        },
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
        node: {
          icon: 'mdi-nodejs',
          name: 'Node.js',
        },
        electron: {
          icon: 'mdi-electron-framework',
          name: 'Electron',
        },
        'nw.js': {
          icon: 'mdi-compass',
          name: 'NW.js',
        },
      },
      headers: [
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
          text: 'Version range',
          value: 'range',
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
    async generateShortURL() {
      this.generatingURL = true;
      try {
        const { data } = await axios.post('https://link.armaldio.xyz/api', {
          path: this.shareURL(),
        });
        this.shortenedURL = data.path;
        this.generatingURL = false;
      } catch (e) {
        console.error(e);
        this.shortenedURL = 'Error generating URL';
        this.generatingURL = false;
      }
    },
    shareURL() {
      const oses = this.os.map(x => (x.value ? x.id : null))
        .filter(x => !!x);
      const arches = this.arch.map(x => (x.value ? x.id : null))
        .filter(x => !!x);
      const runtimes = this.runtime.map(x => (x.value ? x.id : null))
        .filter(x => !!x);
      const versions = this.version.map(x => (x.value ? x.name : null))
        .filter(x => !!x);

      const releaseTag = this.selectedReleaseTag;

      const params = {};
      if (this.os.length !== oses.length) {
        params.os = oses;
      }
      if (this.arch.length !== arches.length) {
        params.arch = arches;
      }
      if (this.runtime.length !== runtimes.length) {
        params.runtime = runtimes;
      }
      if (this.version.length !== versions.length) {
        params.version = versions;
      }
      if (releaseTag) {
        params.tag = releaseTag.name;
      }

      const query = Object.keys(params)
        .map(k => `${k}=${params[k]}`)
        .join('&');

      return `${window.location.origin}?${query}`;
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log('Async: Copying to clipboard was successful!');
        }, (err) => {
          console.error('Async: Could not copy text: ', err);
        });
    },
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
        this.isLoading = false;
        return ret;
      }
      this.isLoading = false;
      return [];
    },
    filterOs(asset) {
      const arches = this.arch.filter(arch => !!arch.value)
        .map(arch => arch.id);
      return arches.length === 0 ? true : arches.includes(asset.arch);
    },
    filterArch(asset) {
      const oses = this.os.filter(os => !!os.value)
        .map(os => os.id);
      return oses.length === 0 ? true : oses.includes(asset.os);
    },
    filterRuntime(asset) {
      const runtimes = this.runtime.filter(runtime => !!runtime.value)
        .map(runtime => runtime.id);
      return runtimes.length === 0 ? true : runtimes.includes(asset.runtime);
    },
    filterVersion(asset) {
      const versions = this.version.filter(version => !!version.value)
        .map(version => version.name);
      return versions.length === 0 ? true : versions.includes(asset.abi.replace('v', ''));
    },
    async dl() {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined') {
        this.showLoginModal = true;
        return;
      }

      this.loadingDialog = true;

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
  async created() {
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

    const filters = ['os', 'arch', 'runtime', 'version'];
    filters.forEach((filter) => {
      if (this.$route.query[filter]) {
        const URLFilters = this.$route.query[filter].split(',');
        this[filter].forEach((el) => {
          // eslint-disable-next-line
            el.value = URLFilters.includes(el.id ? el.id : el.name);
        });
      }
    });

    // ---------------

    const rep = await axios
      .get('https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases', {
        headers: {
          Authorization: `token ${'49f5687fc74189014c37fedce2fc2d85dda344f1'}`,
        },
      });

    this.releases = rep.data.filter(r => semver.gte(r.tag_name, '0.2.6'));
    this.selectedReleaseTag = this.releases[0];

    const { tag } = this.$route.query;
    if (tag) {
      this.selectedReleaseTag = this.releases.find(release => release.name === tag);
    }
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
