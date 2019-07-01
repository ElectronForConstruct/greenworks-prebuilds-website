/* eslint-disable no-console */

import { register } from 'register-service-worker';

const install = (cb) => {
  if (process.env.NODE_ENV === 'production') {
    register(`${process.env.BASE_URL}service-worker.js`, {
      ready() {
        console.log(
          'App is being served from cache by a service worker.\n'
          + 'For more details, visit https://goo.gl/AFskqB',
        );
      },
      registered() {
        console.log('Service worker has been registered.');
      },
      cached() {
        cb('Content has been cached for offline use.');
      },
      updatefound() {
        cb('New content is downloading.');
      },
      updated() {
        cb('New content is available. Please refresh.');
      },
      offline() {
        cb('No internet connection found. App is running in offline mode. You\'ll not be able to download files');
      },
      error(error) {
        console.error('Error during service worker registration:', error);
      },
    });
  }
};

export default install;
