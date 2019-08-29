import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import network from './network';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    dbs: [],
    settings: {
      serverURL: '',
      password: '',
    },
  },
  getters: {
    isSettingsFilled(state) {
      return state.settings.serverURL !== undefined && state.settings.serverURL.length !== 0;
    },
  },
  mutations: {
    saveSettings(state, { serverURL, password }) {
      state.settings.serverURL = serverURL;
      state.settings.password = password;

      network.update();
    },
    setDBs(state, dbs) {
      state.dbs = dbs;
    },
  },
  plugins: [
    createPersistedState(),
  ],
});
