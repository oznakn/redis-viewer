import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import network from './network';
import socket from './socket';

Vue.use(Vuex);

export function getDefaultWorkspaceState() {
  return {
    dbs: [],
    stats: {},
    userType: 0,
    accessKey: '',
    serverURL: `${window.location.host}/api`,
  };
}

export default new Vuex.Store({
  state: {
    selectedWorkspace: 0,
    workspaces: [getDefaultWorkspaceState()],
  },
  getters: {
    workspace(state) {
      return state.workspaces[state.selectedWorkspace];
    },
    dbs(state, getters) {
      return getters.workspace.dbs;
    },
    stats(state, getters) {
      return getters.workspace.stats;
    },
    accessKey(state, getters) {
      return getters.workspace.accessKey;
    },
    serverURL(state, getters) {
      return getters.workspace.serverURL;
    },
    userType(state, getters) {
      return getters.workspace.userType;
    },
    isSettingsFilled(state, getters) {
      return getters.accessKey !== '';
    },
    hasFullAccess(state, getters) {
      return getters.userType === 1;
    },
  },
  mutations: {
    setServerURL(state, serverURL) {
      Vue.set(state.workspaces[state.selectedWorkspace], 'serverURL', serverURL);
    },
    setAccessKey(state, accessKey) {
      Vue.set(state.workspaces[state.selectedWorkspace], 'accessKey', accessKey);
    },
    setDBs(state, dbs) {
      Vue.set(state.workspaces[state.selectedWorkspace], 'dbs', dbs);
    },
    setStats(state, stats) {
      Vue.set(state.workspaces[state.selectedWorkspace], 'stats', stats);
    },
    setUserType(state, userType) {
      Vue.set(state.workspaces[state.selectedWorkspace], 'userType', userType);
    },
    resetWorkspace(state) {
      Vue.set(state.workspaces, state.selectedWorkspace, getDefaultWorkspaceState());
    },
    setWorkspace(state, workspace) {
      while (state.workspaces.length <= workspace) {
        state.workspaces.push(getDefaultWorkspaceState());
      }

      Vue.set(state.workspaces[state.selectedWorkspace], 'dbs', []);
      Vue.set(state.workspaces[state.selectedWorkspace], 'stats', {});

      for (let i = state.workspaces.length - 1; i > workspace; i -= 1) {
        if (state.workspaces[i].accessKey === '') {
          state.workspaces.splice(i, 1);
        }
      }

      state.selectedWorkspace = workspace;
    },
  },
  actions: {
    saveSettingsAndLogin({ dispatch, commit }, { serverURL, username, password }) {
      commit('setServerURL', serverURL);

      network.update();

      return dispatch('login', { username, password });
    },
    login({ commit }, { username, password }) {
      return network
        .login({
          username,
          password,
        })
        .then((response) => {
          commit('setUserType', response.userType);
          commit('setAccessKey', response.accessKey);

          network.update();
          socket.update();
        });
    },
  },
  plugins: [
    createPersistedState(),
  ],
});
