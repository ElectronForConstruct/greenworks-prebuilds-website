<template>
  <v-chip label color="blue">
    {{ this.infos.abi }}
    ({{ range[0] ? range[0] : '' }}
    <v-icon small>mdi-chevron-right</v-icon>
    {{ range[1] ? range[1] : '' }})
  </v-chip>
</template>

<script>
import abis from 'modules-abi';

export default {
  name: 'Range',
  components: {},
  data() {
    return {
      range: [],
    };
  },
  props: {
    infos: {
      type: Object,
    },
  },
  async created() {
    const rt = this.infos.runtime;
    const abi = parseInt(this.infos.abi.replace('v', ''), 10);

    try {
      this.range = await abis.getRange(abi, rt, {
        includeNightly: true,
        includeBeta: true,
        includeReleaseCandidates: true,
      });
    } catch (e) {
      console.error('Unable to get range', e);
    }
  },
};
</script>

<style scoped>

</style>
