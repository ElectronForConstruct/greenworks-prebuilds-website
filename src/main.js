// eslint-disable-next-line
import '@mdi/font/css/materialdesignicons.css';
import Vue from 'vue';
import AsyncComputed from 'vue-async-computed';
import PortalVue from 'portal-vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

Vue.use(AsyncComputed);
Vue.use(PortalVue);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
