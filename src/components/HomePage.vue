<template>
  <div>
    <template v-if="isSettingsFilled">
      <div class="header">
        <div class="db-select-view" :class="{'scroll': dbs.length > 6 }">
          <span>DB: </span>

          <fish-menu
            mode="horizontal"
            size="large"
            @change="onDBChange"
            default-active="0"
            ref="menu">

            <fish-option
              v-for="(db, index) in dbs"
              :index="index"
              :content="db['name']"
              :key="db['id']" />
          </fish-menu>
        </div>

        <div class="nav-right">
          <div class="socket-status" :class="{active: isSocketConnected}">
            <span>{{ isSocketConnected ? 'Socket connected' : 'Socket not connected' }}</span>
          </div>

          <div>
            <fish-switch v-model="enableAutoReload">AutoReload</fish-switch>
          </div>

          <div class="stats">
            <span v-show="stats.memory">Memory: {{ stats.memory }}</span>
            <span v-show="stats.cpu">CPU: {{ stats.cpu }}</span>
          </div>

          <div class="buttons">
            <div @click="openInfoModal">
              <i class="fas fa-info"></i>
            </div>
            <div @click="refreshData">
              <i class="fas fa-sync"></i>
            </div>
            <div @click="openSettingsModal">
              <i class="fas fa-cog"></i>
            </div>
            <div @click="logout">
              <i class="fas fa-sign-out-alt"></i>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentDB">
        <database-view :db="currentDB" :enableAutoReload="enableAutoReload" :key="`db-view-${currentDB['id']}`" />
        <hash-search-view :key="`hash-view-${currentDB['id']}`" />
        <repl-view :key="`repl-view-${currentDB['id']}`" />
      </div>
    </template>

    <template v-else>
      <settings-view style="margin-top: 50px;"/>
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

import DatabaseView from './views/DatabaseView.vue';
import HashSearchView from './views/HashSearchView.vue';
import REPLView from './views/REPLView.vue';
import SettingsView from './views/SettingsView.vue';

export default {
  components: {
    DatabaseView,
    HashSearchView,
    SettingsView,
    replView: REPLView,
  },
  data() {
    return {
      isSocketConnected: this.$socket.isConnected,
      enableAutoReload: true,
      currentDB: undefined,
    };
  },
  created() {
    this.$eventBus.$on('socketStatusChanged', this.onSocketStatusChanged);
    this.$eventBus.$on('refreshSystem', this.refreshSystem);

    this.refreshSystem();
  },
  beforeDestroy() {
    this.$eventBus.$off('socketStatusChanged', this.onSocketStatusChanged);
    this.$eventBus.$off('refreshSystem', this.refreshSystem);
  },
  methods: {
    ...mapMutations(['setDBs', 'resetWorkspace']),
    onDBChange(dbIndex) {
      this.$refs.menu.$children.forEach((child) => {
        child.active = false;
      });
      this.$refs.menu.setActive(dbIndex);

      this.setCurrentDB({ db: this.dbs[dbIndex] });
    },
    onSocketStatusChanged({ isConnected }) {
      this.isSocketConnected = isConnected;
    },
    updateDBs() {
      this.$network.getDBs()
        .then(({ results }) => {
          this.setDBs(results);

          if (this.dbs.length > 0) {
            this.setCurrentDB({ db: this.dbs[0] });
          }
        })
        .catch(() => {
          if (this.isSettingsFilled === true) {
            this.$message.error('Unknown Error!');
          }
        });
    },
    setCurrentDB({ db }) {
      this.currentDB = db;
    },
    openSettingsModal() {
      this.$eventBus.$emit('openSettingsModal');
    },
    openInfoModal() {
      this.$eventBus.$emit('openInfoModal');
    },
    refreshData() {
      this.updateDBs();
    },
    refreshSystem() {
      if (!this.isSettingsFilled) {
        this.$Progress.finish();
      } else {
        if (this.statsInterval !== undefined) {
          clearInterval(this.statsInterval);
        }

        this.$eventBus.$emit('closeModals');
        this.$socket.update();

        this.refreshData();
      }
    },
    logout() {
      this.resetWorkspace();
      this.refreshSystem();
    },
  },
  computed: {
    ...mapGetters(['dbs', 'stats', 'isSettingsFilled']),
    ...mapState(['selectedWorkspace']),
  },
};
</script>

<style lang="scss">
  .header {
    display: flex;
    flex-flow: row nowrap;

    .db-select-view {
      display: flex;
      flex-flow: row nowrap;

      align-items: center;

      span {
        font-weight: 600;
        margin-right: 5px;
        font-size: 1.1rem;
      }

      .fish.menu {
        &.scroll {
          max-width: 800px;

          overflow-x: scroll;
          overflow-y: hidden;
        }
      }
    }

    .nav-right {
      width: 100%;

      display: flex;
      flex-flow: row nowrap;

      &>* {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        margin: 0 14px;
      }

      .stats {
        &>span {
          margin: 0 7px;
        }
      }

      .socket-status {
        padding: 10px;

        font-size: 1.2rem;
        color: red;

        &.active {
          color: green;
        }
      }

      .buttons {
        margin-left: auto;

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
  }
</style>
