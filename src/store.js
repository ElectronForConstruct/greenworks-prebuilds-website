import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    versions: [],
    selected: [],
  },
  mutations: {
    SET_VERSIONS: (state, versions) => {
      // eslint-disable-next-line
      state.versions = versions;
    },
    ADD_SELECTED: (state, item) => {
      state.selected.push(item);
    },
    REMOVE_SELECTED: (state, item) => {
      // eslint-disable-next-line
      state.selected = state.selected.filter(i => i.id !== item.id);
    },
  },
  actions: {},
});
