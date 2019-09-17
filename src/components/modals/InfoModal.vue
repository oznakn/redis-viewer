<template>
  <fish-modal :title="'Info'" :visible.sync="isModalVisible">
    <div>
      Redis Viewer v0.1.0
    </div>

    <div>
      <div>Version: Redis {{ stats.version }}</div>
      <div>OS: {{ stats.os }}</div>
      <div>Memory: {{ stats.memory }}</div>
      <div>CPU: {{ stats.cpu }}</div>
    </div>
  </fish-modal>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      isModalVisible: false,
    };
  },
  created() {
    this.$eventBus.$on('openInfoModal', this.showModal);
    this.$eventBus.$on('closeModals', this.onCloseModalsEvent);
  },
  beforeDestroy() {
    this.$eventBus.$off('openInfoModal', this.showModal);
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
  computed: {
    ...mapState(['stats']),
  },
};
</script>
