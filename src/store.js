import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    versions: [],
  },
  mutations: {
    SET_VERSIONS: (state, versions) => {
      // eslint-disable-next-line
      state.versions = versions;
    },
  },
  actions: {},
});
