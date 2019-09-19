<template>
  <div>
    <fish-layout sider="tl">
      <div slot="sider">
        <div class="logo">Redis Viewer</div>

        <fish-menu
          default-active="0"
          mode="inline"
          @change="onWorkspaceChange"
          ref="workspaceMenu"
          style="width: 120px">

          <fish-option
            v-for="i in (workspaces.length + 1) "
            :index="i-1"
            :key="`workspace-${i}`"
            :content="`Workspace ${i}`"/>
        </fish-menu>
      </div>

      <div slot="content" style="min-height: 100vh; padding: 10px 40px 40px 40px;">
        <home-page :key="`home-page-${selectedWorkspace}}`" />
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
import { mapMutations, mapState } from 'vuex';

import EditKeyModal from './components/modals/EditKeyModal.vue';
import NewKeyModal from './components/modals/NewKeyModal.vue';
import SettingsModal from './components/modals/SettingsModal.vue';
import InfoModal from './components/modals/InfoModal.vue';
import HomePage from './components/HomePage.vue';

export default {
  components: {
    EditKeyModal,
    NewKeyModal,
    SettingsModal,
    InfoModal,
    HomePage,
  },
  mounted() {
    window.addEventListener('keydown', this.onKeyDown);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeyDown);
  },
  methods: {
    ...mapMutations(['setWorkspace']),
    onKeyDown(e) {
      if (e.keyCode === 27) {
        this.$eventBus.$emit('closeModals');
      }
    },
    onWorkspaceChange(workspace) {
      this.$refs.workspaceMenu.$children.forEach((child) => {
        child.active = false;
      });
      this.$refs.workspaceMenu.setActive(workspace);

      this.setWorkspace(workspace);
    },
  },
  computed: {
    ...mapState(['selectedWorkspace', 'workspaces']),
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

  .sider {
    width: 160px !important;
    flex: 0 0 160px !important;
  }
</style>
