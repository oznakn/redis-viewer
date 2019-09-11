import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import network from './network';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    dbs: [],
    accessKey: '',
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
    setSettings(state, { serverURL, username, password }) {
      state.settings.serverURL = serverURL;
      state.settings.username = username;
      state.settings.password = password;
    },
    setAccessKey(state, accessKey) {
      state.accessKey = accessKey;
    },
    setDBs(state, dbs) {
      state.dbs = dbs;
    },
  },
  actions: {
    saveSettings({ dispatch, commit }, { serverURL, username, password }) {
      commit('setSettings', { serverURL, username, password });

      return dispatch('login')
        .then(() => network.update());
    },
    login({ state, commit }) {
      return network.login({ username: state.settings.username, password: state.settings.password })
        .then((response) => {
          commit('setAccessKey', response.accessKey);
        });
    },
  },
  plugins: [
    createPersistedState(),
  ],
});
