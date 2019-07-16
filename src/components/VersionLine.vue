<template>
  <v-list-tile @click="toggleSelection">
    <v-list-tile-action>
      <v-checkbox :input-value="isSelected" primary>
      </v-checkbox>
    </v-list-tile-action>
    <v-list-tile-content>
      <div>
        <v-chip
          label
          color="red">{{infos.runtime}}
        </v-chip>
        <v-chip
          label
          color="green">{{infos.abi}}
        </v-chip>
        <v-chip
          label
          color="purple">{{infos.os}}
        </v-chip>
        <v-chip
          label
          color="grey">{{infos.arch}}
        </v-chip>
      </div>
    </v-list-tile-content>

    <v-list-tile-action>
      <v-chip label color="blue">
        {{ range[0] ? range[0] : '' }}
        <v-icon small class="px-2">fas fa-arrow-right</v-icon>
        {{ range[1] ? range[1] : '' }}
      </v-chip>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
import abis from 'modules-abi';

export default {
  name: 'VersionLine',
  components: {},
  data() {
    return {
      range: [],
      selected: false,
    };
  },
  computed: {
    isSelected() {
      return this.$store.state.selected.find(s => s.id === this.infos.id);
    },
  },
  methods: {
    toggleSelection() {
      if (this.isSelected) {
        this.$store.commit('REMOVE_SELECTED', this.infos);
      } else {
        this.$store.commit('ADD_SELECTED', this.infos);
      }
    },
  },
  props: {
    infos: {
      type: Object,
    },
  },
  async mounted() {
    // console.log(this.infos);

    const rt = this.infos.runtime.replace('node-webkit', 'nw.js');
    const abi = parseInt(this.infos.abi.replace('v', ''), 10);
    this.range = await abis.getRange(rt, abi);
  },
};
</script>

<style scoped>

</style>
