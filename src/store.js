import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    drawer: false,
  },
  mutations: {
    SET_USER: (state, user) => {
      state.user = user;
    },
    SET_DRAWER: (state, drawer) => {
      state.drawer = drawer;
    },
  },
  actions: {},
});
