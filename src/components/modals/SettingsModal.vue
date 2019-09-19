<template>
  <fish-modal :title="'Settings'" :visible.sync="isModalVisible">
    <settings-view />
  </fish-modal>
</template>

<script>
import SettingsView from '../views/SettingsView.vue';

export default {
  components: {
    SettingsView,
  },
  data() {
    return {
      isModalVisible: false,
    };
  },
  created() {
    this.$eventBus.$on('openSettingsModal', this.showModal);
    this.$eventBus.$on('closeModals', this.onCloseModalsEvent);
  },
  beforeDestroy() {
    this.$eventBus.$off('openSettingsModal', this.showModal);
    this.$eventBus.$off('closeModals', this.onCloseModalsEvent);
  },
  methods: {
    showModal() {
      this.isModalVisible = true;
    },
    onCloseModalsEvent() {
      this.isModalVisible = false;
    },
  },
};
</script>
