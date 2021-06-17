<template>
  <span v-if="!range[0] && !range[1]">
    Invalid
  </span>
  <span v-else>
    {{ range[0] ? range[0] : 'Invalid' }}
    <v-icon small>mdi-arrow-right</v-icon>
    {{ range[1] ? range[1] : 'Invalid' }}
  </span>
</template>

<script>
import ABIs from 'modules-abi';

const abis = new ABIs();

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
      console.log('this.range', this.range);
    } catch (e) {
      console.error('Unable to get range', e);
    }
  },
};
</script>

<style scoped>
</style>
