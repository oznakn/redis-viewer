import Vue from 'vue';
import FishUI from 'fish-ui';
import VueProgressBar from 'vue-progressbar';

import App from './App.vue';

import network from './network';
import store from './store';
import socket from './socket';

const options = {
  thickness: '3px',
};

Vue.use(FishUI);
Vue.use(VueProgressBar, options);

Vue.prototype.$network = network;
Vue.prototype.$socket = socket;
Vue.prototype.$eventBus = new Vue();

new Vue({
  created() {
    network.init(this);
    socket.init(this);
  },
  store,
  render: (h) => h(App),
}).$mount('#app');
