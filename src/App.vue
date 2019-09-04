<template>
  <div>
    <fish-layout>
      <nav slot="header" style="display: flex; flex-flow: row nowrap;">
        <div class="logo">
          Redis UI
        </div>

        <database-picker style="margin-left: 40px"></database-picker>

        <div class="socket-status" :class="{active: isSocketConnected}">
          {{ isSocketConnected ? 'Socket connected' : 'Socket not connected' }}
        </div>

        <div class="settings-button" @click="openSettingsModal">
          <i class="fa fa-cog"></i>
        </div>
      </nav>

      <div slot="content" style="min-height: 100vh; padding: 10px 40px 40px 40px;">
        <database-view v-if="currentDB" :db="currentDB" :key="currentDB['id']"></database-view>
        <hash-search-view />
      </div>
    </fish-layout>

    <edit-key-modal />
    <settings-modal />

    <vue-progress-bar />
  </div>
</template>

<script>
import DatabasePicker from './components/DatabasePicker.vue';
import EditKeyModal from './components/EditKeyModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import DatabaseView from './components/DatabaseView.vue';
import HashSearchView from './components/HashSearchView.vue';

export default {
  components: {
    EditKeyModal,
    SettingsModal,
    DatabasePicker,
    DatabaseView,
    HashSearchView,
  },
  data() {
    return {
      currentDB: undefined,
      isSocketConnected: this.$socket.isConnected,
    };
  },
  created() {
    if (this.$store.state.settings.serverURL === undefined
      || this.$store.state.settings.serverURL.length === 0) {
      this.$Progress.finish();

      this.$eventBus.$once('settingsModalReady', () => {
        this.openSettingsModal();
      });
    }

    this.$eventBus.$on('changeDBView', this.changeDBView);
    this.$eventBus.$on('socketStatusChanged', this.onSocketStatusChanged);
  },
  beforeDestroy() {
    this.$eventBus.$off('changeDBView', this.changeDBView);
    this.$eventBus.$off('socketStatusChanged', this.onSocketStatusChanged);
  },
  methods: {
    onSocketStatusChanged({ isConnected }) {
      this.isSocketConnected = isConnected;
    },
    changeDBView({ db }) {
      this.currentDB = db;
    },
    openSettingsModal() {
      this.$eventBus.$emit('openSettingsModal');
    },
  },
};
</script>

<style lang="scss">
  .logo {
    padding: .75em;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .socket-status {
    padding: 10px;

    margin-left: 20px;

    font-size: 1.2rem;
    color: red;

    &.active {
      color: green;
    }
  }

  .settings-button {
    cursor: pointer;

    margin-left: auto;

    padding: 10px;

    font-size: 1.2rem;

    transition: all 100ms ease-in-out;

    background: transparent;

    &:hover {
      background: #f8f8f8;
    }
  }
</style>
