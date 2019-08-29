<template>
  <div>
    <database-view v-if="currentDB" :db="currentDB" :key="currentDB['id']"></database-view>
    <hash-search-view />
  </div>
</template>

<script>
import DatabaseView from '../components/DatabaseView.vue';
import HashSearchView from '../components/HashSearchView.vue';

export default {
  components: {
    DatabaseView,
    HashSearchView,
  },
  data() {
    return {
      currentDB: undefined,
    };
  },
  created() {
    this.$eventBus.$on('changeDBView', this.changeDBView);
  },
  beforeDestroy() {
    this.$eventBus.$off('changeDBView', this.changeDBView);
  },
  methods: {
    changeDBView({ db }) {
      this.currentDB = db;
    },
  },
};
</script>
