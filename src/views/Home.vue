<template>
  <div class="home">
    <portal to="share-btn">
      <v-btn text class="mr-2" @click="shareModal = true">
        <v-icon>mdi-share-outline</v-icon>
        <span class="ml-2 hidden-md-and-down">Share URL</span>
      </v-btn>
    </portal>
    <v-navigation-drawer v-model="$store.state.drawer" clipped fixed app :width="300">
      <v-list dense>
        <v-list-item-content>
          <v-select
            :loading="releases.length === 0"
            return-object
            class="mx-3"
            :items="releases"
            v-model="selectedReleaseTag"
            item-text="name"
            label="Release Tag"
          >
            <template #item="{ item, on }">
              <v-list-item v-on="item.type === 'tag' ? on : {}">
                <v-list-item-content disabled v-if="item.type === 'subheader'">
                  <v-list-item-title class="subheader">{{ item.text }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-content v-if="item.type === 'tag'">
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-select>
        </v-list-item-content>

        <v-select
          class="mx-3"
          v-model="selectedOs"
          :items="os"
          label="OS"
          item-text="name"
          item-value="id"
          multiple
        >
          <template #prepend-item>
            <v-list-item ripple @click="toggleSelection('selectedOs', 'os')">
              <v-list-item-action>
                <v-icon v-if="selectedOs.length === 0">mdi-checkbox-blank-outline</v-icon>
                <v-icon
                  v-else
                >{{ allChecked('selectedOs', 'os') ? 'mdi-close-box' : 'mdi-minus-box' }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Select All</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-2"></v-divider>
          </template>
        </v-select>

        <v-select
          class="mx-3"
          v-model="selectedArch"
          :items="arch"
          label="Architecture"
          item-text="name"
          item-value="id"
          multiple
        >
          <template #prepend-item>
            <v-list-item ripple @click="toggleSelection('selectedArch', 'arch')">
              <v-list-item-action>
                <v-icon v-if="selectedArch.length === 0">mdi-checkbox-blank-outline</v-icon>
                <v-icon
                  v-else
                >
                {{ allChecked('selectedArch', 'arch') ? 'mdi-close-box' : 'mdi-minus-box' }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Select All</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-2"></v-divider>
          </template>
        </v-select>

        <v-select
          class="mx-3"
          v-model="selectedRuntime"
          :items="runtime"
          label="Runtime"
          item-text="name"
          item-value="id"
          multiple
        >
          <template #prepend-item>
            <v-list-item ripple @click="toggleSelection('selectedRuntime', 'runtime')">
              <v-list-item-action>
                <v-icon v-if="selectedRuntime.length === 0">mdi-checkbox-blank-outline</v-icon>
                <v-icon
                  v-else
                >
                {{ allChecked('selectedRuntime', 'runtime') ? 'mdi-close-box' : 'mdi-minus-box' }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Select All</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-2"></v-divider>
          </template>
        </v-select>

        <v-select
          class="mx-3"
          v-model="selectedVersion"
          :items="version"
          label="Versions"
          item-text="name"
          item-value="id"
          multiple
        >
          <template #selection="{ item, index }">
            <div v-if="index <= 2" style="white-space: pre;">
              {{ item.name }}
              {{ includeComma(index, selectedVersion.length) ? ', ' : '' }}
            </div>
            <span
              v-if="index === 3"
              class="grey--text text-caption"
            >(+{{ selectedVersion.length - 3 }} more)</span>
          </template>
          <template #prepend-item>
            <v-list-item ripple @click="toggleSelection('selectedVersion', 'version')">
              <v-list-item-action>
                <v-icon v-if="selectedVersion.length === 0">mdi-checkbox-blank-outline</v-icon>
                <v-icon
                  v-else
                >
                {{ allChecked('selectedVersion', 'version') ? 'mdi-close-box' : 'mdi-minus-box' }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Select All</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-2"></v-divider>
          </template>
        </v-select>
      </v-list>

      <div class="text-center">
        <v-btn @click="resetFilters">Clear filters</v-btn>
      </div>
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
          <template #top>
            <v-toolbar flat>
              <v-spacer></v-spacer>
              <v-btn
                :disabled="filteredSelectedFiles.length === 0 || loadingDialog === true"
                @click="dl"
              >
                <v-icon left>mdi-folder-download</v-icon>
                Download {{ filteredSelectedFiles.length }}
                file{{ filteredSelectedFiles.length > 1 ? 's' : '' }}
                {{ filteredSelectedFiles.length > 0 ? `(${calculateTotalSize}MB)`
                : '' }}
              </v-btn>
              <!-- 1049000 bytes to mib -->
            </v-toolbar>
          </template>
          <template #[`item.os`]="{ item }">
            <v-chip class="ma-1" :color="iconSet[item.os].color" label>
              <v-icon left>{{ iconSet[item.os].icon }}</v-icon>
              {{ iconSet[item.os].name }}
            </v-chip>
          </template>
          <template #[`item.runtime`]="{ item }">
            <v-chip class="ma-1" :color="iconSet[item.runtime].color" label>
              <v-icon left>{{ iconSet[item.runtime].icon }}</v-icon>
              {{ iconSet[item.runtime].name }}
            </v-chip>
          </template>
          <template #[`item.size`]="{ item }">
            <v-chip class="ma-1" label>{{ Math.round(item.size/1049000*100)/100 }} MB</v-chip>
          </template>
          <template #[`item.arch`]="{ item }">
            <v-chip class="ma-1" :color="iconSet[item.arch].color" label>
              <v-icon left>{{ iconSet[item.arch].icon }}</v-icon>
              {{ iconSet[item.arch].name }}
            </v-chip>
          </template>
          <template #[`item.updated_at`]="{ item }">
            <v-tooltip top>
              <template #activator="{ on }">
                <span :style="{ cursor: 'pointer'}" v-on="on">
                  {{ dayjs(item.updated_at).fromNow() }}
                </span>
              </template>
              <span>{{ dayjs(item.updated_at) }}</span>
            </v-tooltip>
          </template>
          <template #[`item.abi`]="{ item }">
            <span>{{ item.abi }}</span>
          </template>
          <template #[`item.range`]="{ item }">
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
          <v-card-title class="text-h5">Download Info</v-card-title>
          <v-card-text>
            <span>
              Please
              <a :href="loginUrl()">login to GitHub</a> to enable file downloading!
            </span>
            <br />
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
          <v-card-title class="text-h5">URL sharing</v-card-title>
          <v-card-text>
            <p>You can share this URL to link directly to filtered assets</p>
            <v-text-field readonly :value="shareURL()" label="URL" type="text"></v-text-field>
            <!-- <v-text-field
              readonly
              :value="shortenedURL"
              label="Shortened URL"
              type="text"
            >
            </v-text-field>-->
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn v-if="shortenedURL" @click="copyToClipboard(shortenedURL)">Copy short URL</v-btn>
            <!-- <v-btn
              v-else
              :loading="generatingURL"
              @click="generateShortURL()">
              Generate short URL
            </v-btn>-->
            <v-btn @click="copyToClipboard(shareURL())">Copy URL</v-btn>
            <v-btn @click="shareModal = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import axios from 'axios';
import { saveAs } from 'file-saver';
import abis from 'modules-abi';
// import semver from 'semver';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import Range from '../components/Range.vue';

dayjs.extend(relativeTime);

// const sleep = m => new Promise(r => setTimeout(r, m));

const mapped = (asset) => {
  const arr = asset.name.split(/(.*?)-(.*)-(v.*?)-(.*?)-(.*?)\.node/);
  return {
    ...asset,
    runtime: arr[2],
    abi: arr[3],
    os: arr[4],
    arch: arr[5],
  };
};

export default {
  name: 'home',
  components: {
    Range,
  },
  filters: {
    formatName(value) {
      return value.replace(
        /(.*?)-(.*)-(v.*?)-(.*?)-(.*?)\.node/,
        '$2 $3 $4 $5',
      );
    },
  },
  computed: {
    selectedRelease() {
      console.log('this.releases', this.releases);
      return this.releases.find((r) => r === this.selectedReleaseTag);
    },
    filteredSelectedFiles() {
      return this.selectedFiles
        .filter(this.filterOs)
        .filter(this.filterArch)
        .filter(this.filterRuntime)
        .filter(this.filterVersion);
      // .reverse();
    },
    calculateTotalSize() {
      return (
        Math.round(
          (this.filteredSelectedFiles.reduce(
            (prev, curr) => prev + curr.size,
            0,
          )
            / 1049000)
            * 100,
        ) / 100
      );
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
          color: '#c83227',
        },
        x64: {
          icon: 'mdi-cpu-64-bit',
          name: '64 bits',
          color: '#1C8E8E',
        },
        darwin: {
          icon: 'mdi-apple',
          name: 'Mac',
          color: '#959595',
        },
        win32: {
          icon: 'mdi-microsoft-windows',
          name: 'Windows',
          color: '#0078d7',
        },
        linux: {
          icon: 'mdi-linux',
          name: 'Linux',
          color: '#E99829',
        },
        node: {
          icon: 'mdi-nodejs',
          name: 'Node.js',
          color: '#6cc24a',
        },
        electron: {
          icon: 'mdi-electron-framework',
          name: 'Electron',
          color: '#2F3241',
        },
        'nw.js': {
          icon: 'mdi-compass',
          name: 'NW.js',
          color: '#1579A5',
        },
      },
      headers: [
        {
          text: 'Architecture',
          value: 'arch',
          width: 100,
        },
        {
          text: 'OS',
          value: 'os',
          width: 100,
        },
        {
          text: 'Runtime',
          value: 'runtime',
          width: 100,
        },
        {
          text: 'Size',
          value: 'size',
          width: 100,
        },
        {
          text: 'Version range',
          value: 'range',
          width: 200,
        },
        {
          text: 'ABI',
          value: 'abi',
          width: 135,
        },
        {
          text: 'Last update',
          value: 'updated_at',
          width: 150,
        },
      ],
      selectedOs: [],
      os: [
        {
          name: 'Mac',
          id: 'darwin',
        },
        {
          name: 'Windows',
          id: 'win32',
        },
        {
          name: 'Linux',
          id: 'linux',
        },
      ],
      selectedArch: [],
      arch: [
        {
          name: '64 bits',
          id: 'x64',
        },
        {
          name: '32 bits',
          id: 'ia32',
        },
      ],
      selectedRuntime: [],
      runtime: [],
      selectedVersion: [],
      version: [],

      selectedReleaseTag: null,
      releases: [],
    };
  },
  methods: {
    resetFilters() {
      const filters = [
        ['os', 'selectedOs'],
        ['arch', 'selectedArch'],
        ['runtime', 'selectedRuntime'],
        ['version', 'selectedVersion'],
      ];
      // fill everything
      filters.forEach(([filter, bind]) => {
        this[bind] = this[filter].map((f) => f.id);
      });

      // fill only what is in the query
      filters.forEach(([filter, bind]) => {
        if (this.$route.query[filter]) {
          this[bind] = this.$route.query[filter].split(',');
        }
      });
    },
    includeComma(index, length) {
      return index !== length - 1 && index < 2;
    },
    allChecked(name, source) {
      return this[name].length === this[source].length;
    },
    toggleSelection(name, source) {
      this.$nextTick(() => {
        const allSelected = this.allChecked(name, source);
        if (allSelected) {
          this[name] = [];
        } else {
          this[name] = this[source].map((entry) => entry.id);
        }
      });
    },
    async generateShortURL() {
      this.generatingURL = true;
      try {
        // const { data } = await axios.post('https://link.armaldio.xyz/api', {
        //   path: this.shareURL(),
        // });
        // const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${this.shareURL()}`);
        // console.log(data);
        // this.shortenedURL = data.path;
        this.generatingURL = false;
      } catch (e) {
        console.error(e);
        this.shortenedURL = 'Error generating URL';
        this.generatingURL = false;
      }
    },
    dayjs,
    shareURL() {
      const oses = this.selectedOs;
      const arches = this.selectedArch;
      const runtimes = this.selectedRuntime;
      const versions = this.selectedVersion;

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
        .map((k) => `${k}=${params[k]}`)
        .join('&');

      return `${window.location.origin}?${query}`;
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(
        () => {
          console.log('Async: Copying to clipboard was successful!');
        },
        (err) => {
          console.error('Async: Could not copy text: ', err);
        },
      );
    },
    loginUrl() {
      const isDev = process.env.NODE_ENV === 'development';
      return `https://github.com/login/oauth/authorize?client_id=${
        isDev ? 'e80afe92dc3477294936' : '8af5faeab9599fc013ed'
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
    filterArch(asset) {
      const arches = this.selectedArch;
      return arches.length === 0 ? true : arches.includes(asset.arch);
    },
    filterOs(asset) {
      const oses = this.selectedOs;
      return oses.length === 0 ? true : oses.includes(asset.os);
    },
    filterRuntime(asset) {
      const runtimes = this.selectedRuntime;
      return runtimes.length === 0 ? true : runtimes.includes(asset.runtime);
    },
    filterVersion(asset) {
      const versions = this.selectedVersion;
      return versions.length === 0
        ? true
        : versions.includes(asset.abi);
    },
    async dl() {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined') {
        this.showLoginModal = true;
        return;
      }

      this.loadingDialog = true;

      const url = `/.netlify/functions/downloadBundle?ids=${this.filteredSelectedFiles
        .map((file) => file.id)
        .join(',')}&token=${token}`;

      try {
        const { data } = await axios.get(url, {
          responseType: 'blob',
          onDownloadProgress(progress) {
            this.downloadProgress = progress.loaded
              / this.filteredSelectedFiles.reduce(
                (prev, curr) => prev + curr.size,
                0,
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
    const uniq = (arr, key) => Array.from(
      new Set(arr.map((a) => a[key])),
    ).map((id) => arr.find((a) => a[key] === id));

    const toTitleCase = (s) => s.substr(0, 1).toUpperCase() + s.substr(1).toLowerCase();

    const _allReleases = await abis.getAll();
    const allReleases = _allReleases.filter((release) => release.abi >= 57);

    // ---------------

    const rep = await axios.get(
      'https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );

    const releases = rep.data.filter((r) => !r.prerelease);
    releases.forEach((r) => {
      // eslint-disable-next-line no-param-reassign
      r.type = 'tag';
    });

    const prereleases = rep.data.filter((r) => r.prerelease);
    prereleases.forEach((r) => {
      // eslint-disable-next-line no-param-reassign
      r.type = 'tag';
    });

    const subheader = (label) => ({
      type: 'subheader',
      text: label,
    });

    this.releases = [
      subheader('Releases'),
      ...releases,
      subheader('Pre-releases'),
      ...prereleases,
    ];

    this.selectedReleaseTag = this.releases[1];

    /* this.version = uniq(allReleases, 'abi')
      .map((el) => el.abi)
      .sort((a, b) => b - a) // descending, high on top
      .map((el) => ({
        id: el.toString(),
        name: `v${el.toString()}`,
      })); */
    this.version = [...new Set(this.filteredReleaseAssets().map((asset) => asset.abi))]
      .sort() // descending, high on top
      .reverse()
      .map((version) => ({
        id: version,
        name: version,
      }));
    console.log('this.version', this.version);

    this.runtime = uniq(allReleases, 'runtime').map((el) => ({
      name: toTitleCase(el.runtime.toString()).replace('Nw', 'NW'),
      id: el.runtime.toString(),
      value: true,
    }));

    this.resetFilters();

    const { tag } = this.$route.query;
    if (tag) {
      this.selectedReleaseTag = this.releases.find(
        (release) => release.name === tag,
      );
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

.subheader {
  color: grey;
  font-size: 14px;
}
</style>
