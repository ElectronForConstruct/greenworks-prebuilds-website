import Vue from 'vue';
import * as components from 'vuetify/lib';
import Vuetify from 'vuetify/lib/framework';

const {
  ClickOutside, Intersect, Mutate, Resize, Ripple, Scroll, Touch, colors, ...rest
} = components;

Vue.use(Vuetify, {
  components: {
    ...rest,
  },
  directives: {
    ClickOutside,
    Intersect,
    Mutate,
    Resize,
    Ripple,
    Scroll,
    Touch,
  },
});

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
});
