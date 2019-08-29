import Vue from 'vue';
import FishUI from 'fish-ui';
import VueProgressBar from 'vue-progressbar';

import App from './App.vue';

import network from './network';
import router from './router';
import store from './store';

const options = {
  thickness: '5px',
};

Vue.use(FishUI);
Vue.use(VueProgressBar, options);

Vue.config.productionTip = false;

Vue.prototype.$network = network;
Vue.prototype.$eventBus = new Vue();

new Vue({
  created() {
    network.init(this);

    this.$Progress.start();

    this.$router.beforeEach((to, from, next) => {
      this.$Progress.start();
      next();
    });

    this.$router.afterEach(() => {
      setTimeout(() => {
        this.$Progress.finish();
      }, 10);
    });
  },
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
