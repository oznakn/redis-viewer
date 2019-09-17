<template>
  <div>
    <fish-layout>
      <nav slot="header" style="display: flex; flex-flow: row nowrap;">
        <div class="logo">
          Redis Viewer
        </div>

        <div>
          <fish-menu
            mode="horizontal"
            size="large"
            @change="onDBChange"
            ref="menu">

            <fish-option
              v-for="(db, index) in dbs"
              :index="`${index}`"
              :content="db['name']"
              :key="db['id']" />
          </fish-menu>
        </div>

        <div class="nav-right">
          <div class="socket-status" :class="{active: isSocketConnected}">
            <span>{{ isSocketConnected ? 'Socket connected' : 'Socket not connected' }}</span>
          </div>

          <div v-if="stats" class="stats">
            <span>Memory: {{ stats.memory }}</span>
            <span>CPU: {{ stats.cpu }}</span>
          </div>

          <div class="buttons">
            <div @click="openInfoModal">
              <i class="fas fa-info"></i>
            </div>
            <div @click="refreshData">
              <i class="fas fa-sync"></i>
            </div>
            <div @click="openSettingsModal">
              <i class="fa fa-cog"></i>
            </div>
          </div>
        </div>
      </nav>

      <div slot="content" style="min-height: 100vh; padding: 10px 40px 40px 40px;">
        <database-view v-if="currentDB" :db="currentDB" :key="currentDB['id']"></database-view>
        <hash-search-view />
        <repl-view />
      </div>
    </fish-layout>

    <edit-key-modal />
    <new-key-modal />
    <settings-modal />
    <info-modal />

    <vue-progress-bar />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

import EditKeyModal from './components/modals/EditKeyModal.vue';
import NewKeyModal from './components/modals/NewKeyModal.vue';
import SettingsModal from './components/modals/SettingsModal.vue';
import InfoModal from './components/modals/InfoModal.vue';
import DatabaseView from './components/views/DatabaseView.vue';
import HashSearchView from './components/views/HashSearchView.vue';
import REPLView from './components/views/REPLView.vue';

export default {
  components: {
    EditKeyModal,
    NewKeyModal,
    SettingsModal,
    DatabaseView,
    InfoModal,
    HashSearchView,
    replView: REPLView,
  },
  data() {
    return {
      currentDB: undefined,
      isSocketConnected: this.$socket.isConnected,
      statsInterval: undefined,
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

    this.statsInterval = setInterval(() => this.fetchRedisStats(), 60000);

    this.updateDBs();
    this.fetchRedisStats();
  },
  mounted() {
    window.addEventListener('keydown', this.onKeyDown);
  },
  beforeDestroy() {
    this.$eventBus.$off('changeDBView', this.changeDBView);
    this.$eventBus.$off('socketStatusChanged', this.onSocketStatusChanged);

    window.removeEventListener('keydown', this.onKeyDown);
  },
  methods: {
    ...mapMutations(['setDBs', 'setStats']),
    onSocketStatusChanged({ isConnected }) {
      this.isSocketConnected = isConnected;
    },
    changeDBView({ db }) {
      this.currentDB = db;
    },
    openSettingsModal() {
      this.$eventBus.$emit('openSettingsModal');
    },
    openInfoModal() {
      this.$eventBus.$emit('openInfoModal');
    },
    onKeyDown(e) {
      if (e.keyCode === 27) {
        this.$eventBus.$emit('closeModals');
      }
    },
    onDBChange(dbIndex) {
      this.$refs.menu.$children.forEach((child) => {
        child.active = false;
      });
      this.$refs.menu.setActive(dbIndex);

      this.$eventBus.$emit('changeDBView', { db: this.dbs[dbIndex] });
    },
    updateDBs() {
      this.$network.getDBs()
        .then(({ results }) => {
          this.setDBs(results);

          if (this.dbs.length > 0) {
            this.$eventBus.$emit('changeDBView', { db: this.dbs[0] });
          }
        })
        .catch(() => {
          if (this.isSettingsFilled === true) {
            this.$message.error('Unknown Error!');
          }
        });
    },
    fetchRedisStats() {
      this.$network.getRedisStats()
        .then((response) => this.setStats(response.result));
    },
    refreshData() {
      this.updateDBs();
    },
  },
  computed: {
    ...mapState(['dbs', 'stats']),
  },
};
</script>

<style lang="scss">
  .logo {
    padding: .75em;
    font-weight: bold;
    font-size: 1.2rem;

    min-width: 150px;
  }

  .nav-right {
    width: 100%;

    display: flex;
    flex-flow: row nowrap;

    .stats {
      margin: 0 14px;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;

      &>span {
        margin: 0 7px;
      }
    }

    .socket-status {
      padding: 10px;

      margin-left: 20px;

      font-size: 1.2rem;
      color: red;

      display: flex;
      flex-flow: row nowrap;
      align-items: center;

      &.active {
        color: green;
      }
    }

    .buttons {
      margin-left: auto;
      display: flex;
      flex-flow: row nowrap;

      &>div {
        font-size: 1.2rem;
        padding: 10px;
        cursor: pointer;

        transition: all 100ms ease-in-out;

        background: transparent;

        &:hover {
          background: #f8f8f8;
        }
      }
    }
  }
</style>
