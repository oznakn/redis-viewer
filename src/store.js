import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import network from './network';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    dbs: [],
    stats: {},
    accessKey: '',
    userType: 0,
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
    hasFullAccess(state) {
      return state.userType === 1;
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
    setStats(state, stats) {
      state.stats = stats;
    },
    setUserType(state, userType) {
      state.userType = userType;
    },
  },
  actions: {
    saveSettings({ dispatch, commit }, { serverURL, username, password }) {
      commit('setSettings', { serverURL, username, password });

      network.update();

      return dispatch('login');
    },
    login({ state, commit }) {
      return network.login({ username: state.settings.username, password: state.settings.password })
        .then((response) => {
          commit('setUserType', response.userType);
          commit('setAccessKey', response.accessKey);
        });
    },
  },
  plugins: [
    createPersistedState(),
  ],
});
