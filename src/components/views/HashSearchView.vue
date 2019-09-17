<template>
  <div>
    <div class="hash-search-view-bg-overlay"
      :class="{'visible': isVisible}"
      @click="isVisible = false"></div>

    <div class="hash-search-view" :class="{'visible': isVisible}">
      <fish-card fluid style="padding-bottom: 60px">
        <span class="hash-search-view-close-button" @click="closeView">
          <i class="fa fa-lg fa-times"></i>
        </span>

        <database-view
          v-if="db"
          :db="db"
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
    this.$eventBus.$on('closeModals', this.closeView);
  },
  beforeDestroy() {
    this.$eventBus.$off('openHashSearchView', this.openView);
    this.$eventBus.$off('closeModals', this.closeView);
  },
  methods: {
    openView({ db, hash }) {
      this.db = db;
      this.hash = hash;
      this.isVisible = true;
    },
    closeView() {
      this.db = undefined;
      this.hash = undefined;
      this.isVisible = false;
    },
  },
};
</script>

<style lang="scss">
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

    .fish.card {
      height: 100%;
    }

    .hash-search-view-close-button {
      display: inline-block;
      cursor: pointer;

      position: absolute;

      right: 10px;
      top: 10px;
    }
  }
</style>
