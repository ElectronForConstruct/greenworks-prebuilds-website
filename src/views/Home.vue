<template>
  <div class="home">
    <v-navigation-drawer clipped fixed app permanent :width="250">
      <v-list dense>
        <v-subheader>Release Tag</v-subheader>

        <v-radio-group v-model="selectedReleaseTag"
                       mandatory
                       class="full-width"
                       v-if="releases.length > 0">
          <v-list-tile @click="() => {}"
                       v-for="release in releases"
                       :key="release.tag_name">
            <v-list-tile-action>
              <v-radio :value="release"></v-radio>
            </v-list-tile-action>

            <v-list-tile-content @click="selectedReleaseTag = release">
              <v-list-tile-title>
                {{ release.tag_name }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-radio-group>
        <v-list-tile @click="() => {}"
                     v-else>
          <v-list-tile-content>
            <v-list-tile-title>
              Loading releases...
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-subheader>OS</v-subheader>
        <v-list-tile @click="() => {}" v-for="os in oses" :key="os.name">
          <v-list-tile-action>
            <v-checkbox v-model="os.value"></v-checkbox>
          </v-list-tile-action>

          <v-list-tile-content @click="os.value = !os.value">
            <v-list-tile-title>
              {{ os.name }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-subheader>Arch</v-subheader>
        <v-list-tile @click="() => {}" v-for="arch in arches" :key="arch.name">
          <v-list-tile-action>
            <v-checkbox v-model="arch.value"></v-checkbox>
          </v-list-tile-action>

          <v-list-tile-content @click="arch.value = !arch.value">
            <v-list-tile-title>
              {{ arch.name }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-subheader>Runtime</v-subheader>
        <v-list-tile @click="() => {}" v-for="runtime in runtimes" :key="runtime.name">
          <v-list-tile-action>
            <v-checkbox v-model="runtime.value"></v-checkbox>
          </v-list-tile-action>

          <v-list-tile-content @click="runtime.value = !runtime.value">
            <v-list-tile-title>
              {{ runtime.name }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-subheader>Versions</v-subheader>
        <v-list-tile @click="() => {}" v-for="version in versions" :key="version.name">
          <v-list-tile-action>
            <v-checkbox v-model="version.value"></v-checkbox>
          </v-list-tile-action>

          <v-list-tile-content @click="version.value = !version.value">
            <v-list-tile-title>
              {{ version.name }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
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

    <v-layout row wrap>
      <v-flex xs12 class="pb-2">
        <v-text-field
          v-model="search"
          append-icon="fas fa-search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-flex>
      <v-flex xs12>
        <v-data-table v-model="selectedFiles"
                      :headers="headers"
                      :items="filteredReleaseAssets"
                      v-if="filteredReleaseAssets"
                      item-key="name"
                      select-all
                      sort-icon="fas fa-chevron-circle-down"
                      :search="search"
                      :rows-per-page-items="[
                              {'text':'$vuetify.dataIterator.rowsPerPageAll','value':-1}
                          ]"
                      class="elevation-1">
          <template v-slot:items="props">
            <td>
              <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
            </td>
            <td class="text-xs-center">{{ props.item.runtime }}</td>
            <td class="text-xs-center">{{ props.item.abi }}</td>
            <td class="text-xs-center">{{ props.item.os }}</td>
            <td class="text-xs-center">{{ props.item.arch }}</td>
            <td class="text-xs-center">{{ props.item.versions ? props.item.versions : '' }}</td>
          </template>
        </v-data-table>
      </v-flex>

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
    </v-layout>
  </div>
</template>

<script>
import { saveAs } from 'file-saver';
import ky from 'ky';

const sleep = m => new Promise(r => setTimeout(r, m));

const mapped = async (asset) => {
  const arr = asset.name.split(/(.*?)-(.*)-(v.*?)-(.*?)-(.*?)\.node/);
  let range = null;
  try {
    const rt = arr[2].replace('node-webkit', 'nw.js');
    const abi = parseInt(arr[3].replace('v', ''), 10);
    range = await ky.get(`https://modules-abi.armaldio.now.sh/api?mode=range&runtime=${rt}&abi=${abi}`).json();
  } catch (e) {
    console.log('unable to fetch');
  }
  return Object.assign({}, asset, {
    runtime: arr[2],
    abi: arr[3],
    os: arr[4],
    arch: arr[5],
    // eslint-disable-next-line
    versions: range ? (range.length === 2 ? `From ${range[0]} to ${range[1]}` : range.join(', ')) : range,
  });
};

export default {
  name: 'home',
  filters: {
    formatName(value) {
      return value.replace(/(.*?)-(.*)-(v.*?)-(.*?)-(.*?)\.node/, '$2 $3 $4 $5');
    },
  },
  asyncComputed: {
    async filteredReleaseAssets() {
      if (this.selectedRelease) {
        const assets = [];
        for (let i = 0; i < this.selectedRelease.assets.length; i += 1) {
          const asset = this.selectedRelease.assets[i];
          // eslint-disable-next-line
            assets.push(await mapped(asset));
        }
        return assets
          .filter(this.filterOs)
          .filter(this.filterArch)
          .filter(this.filterRuntime)
          .filter(this.filterVersion);
      }
      return [];
    },
  },
  computed: {
    selectedRelease() {
      return this.releases.find(r => r === this.selectedReleaseTag);
    },
  },
  data() {
    return {
      search: '',
      loadingDialog: false,
      oses: [
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
      arches: [
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
      runtimes: [
        {
          name: 'Electron',
          id: 'electron',
          value: true,
        },
        {
          name: 'NW.js',
          id: 'node-webkit',
          value: true,
        },
        {
          name: 'Node',
          id: 'node',
          value: true,
        },
      ],
      versions: [
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
      selectedFiles: [],

      headers: [
        {
          text: 'Runtime',
          value: 'runtime',
          align: 'center',
        },
        {
          text: 'Abi',
          value: 'abi',
          align: 'center',
        },
        {
          text: 'OS',
          value: 'os',
          align: 'center',
        },
        {
          text: 'Architecture',
          value: 'arch',
          align: 'center',
        },
        {
          text: 'Versions',
          value: 'versions',
          align: 'center',
        },
      ],
    };
  },
  methods: {
    filterOs(asset) {
      return !!this.oses.find(os => os.id === asset.os && os.value === true);
    },
    filterArch(asset) {
      return !!this.arches.find(arch => arch.id === asset.arch && arch.value === true);
    },
    filterRuntime(asset) {
      return !!this.runtimes.find(
        runtime => runtime.id === asset.runtime && runtime.value === true,
      );
    },
    filterVersion(asset) {
      return !!this.versions.find(
        version => version.name === asset.abi.replace('v', '') && version.value === true,
      );
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
    this.releases = rep;
    // eslint-disable-next-line
      this.selectedReleaseTag = this.releases[ 0 ];
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

</style>
