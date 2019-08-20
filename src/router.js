import Vue from 'vue';
import Router from 'vue-router';

import HomePage from './pages/HomePage.vue';
import SettingsPage from './pages/SettingsPage.vue';

Vue.use(Router);

export default new Router({
  routes: [
    { path: '/', component: HomePage },
    { path: '/settings', component: SettingsPage },
  ],
  mode: 'history',
});
