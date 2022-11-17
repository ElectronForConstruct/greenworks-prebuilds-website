<template>
  <span>
    {{ range[0] ? range[0] : '' }}
    <v-icon small>mdi-arrow-right</v-icon>
    {{ range[1] ? range[1] : '' }}
  </span>
</template>

<script>
import { getRange } from 'modules-abi';

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
      this.range = await getRange(abi, rt, {
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
