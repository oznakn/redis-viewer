<template>
  <fish-modal title="Welcome.." :visible.sync="isModalVisible">
    <database-view :db="db"></database-view>
  </fish-modal>
</template>

<script>
import DatabaseView from './DatabaseView.vue';

export default {
  components: {
    DatabaseView,
  },
  data() {
    return {
      isModalVisible: false,
      db: undefined,
    };
  },
  created() {
    this.$eventBus.$on('openEditDatabaseItemModal', this.showModal);
  },
  beforeDestroy() {
    this.$eventBus.$off('openEditDatabaseItemModal', this.showModal);
  },
  methods: {
    showModal({ db }) {
      this.db = db;
      this.isModalVisible = true;
    },
  },
};
</script>
