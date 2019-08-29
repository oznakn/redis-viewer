<template>
  <div>
    <div class="hash-search-view-bg-overlay" :class="{'visible': isVisible}" @click="isVisible = false"></div>

    <div class="hash-search-view" :class="{'visible': isVisible}">
      <fish-card fluid>
        <database-view
          v-if="db"
          :db="db"
          workMode="hash"
          :hash="hash"
          style="padding: 30px" />
      </fish-card>
    </div>
  </div>
</template>

<script>
import DatabaseView from './DatabaseView.vue';

export default {
  components: {
    DatabaseView,
  },
  data() {
    return {
      isVisible: false,
      db: undefined,
      hash: undefined,
    };
  },
  created() {
    this.$eventBus.$on('openHashSearchView', this.openView);
  },
  beforeDestroy() {
    this.$eventBus.$off('openHashSearchView', this.openView);
  },
  methods: {
    openView({ db, hash }) {
      this.db = db;
      this.hash = hash;
      this.isVisible = true;
    },
  },
};
</script>

<style lang="scss">
  .hash-search-view {
    position: fixed;
    bottom: 10px;
    left: 10px;
    right: 10px;

    transform: translateY(150%);

    z-index: 101;

    transition: all 400ms ease-in-out;

    &.visible {
      transform: translateY(0%);
    }
  }

  .hash-search-view-bg-overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    z-index: 100;

    background: rgba(0, 0, 0, 0.3);

    display: none;

    cursor: pointer;

    &.visible {
      display: block;
    }
  }
</style>
