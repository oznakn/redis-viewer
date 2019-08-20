import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import network from './network';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    settings: {
      serverURL: '',
      username: '',
      password: '',
    },
  },
  getters: {
    isSettingsFilled(state) {
      return state.settings.serverURL !== undefined && state.settings.serverURL.length !== 0;
    },
  },
  mutations: {
    saveSettings(state, { serverURL, username, password }) {
      state.settings.serverURL = serverURL;
      state.settings.username = username;
      state.settings.password = password;

      network.update();
    },
  },
  plugins: [
    createPersistedState(),
  ],
});
