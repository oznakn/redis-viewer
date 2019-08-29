<template>
  <div>
    <fish-layout :sider="isMenuVisible ? 'l' : undefined">
      <nav slot="header" style="display: flex; flex-flow: row nowrap;">
        <div style="display: flex; align-items: center; margin-left: 5px;">
          <i class="fa fa-lg fa-bars" style="cursor: pointer;" @click="toggleMenu"></i>
        </div>

        <div class="logo">
          Redis UI
        </div>
      </nav>

      <div v-show="isMenuVisible" slot="sider">
        <app-menu></app-menu>
      </div>

      <div slot="content" style="min-height: 100vh; padding: 10px 40px 40px 40px;">
        <router-view></router-view>
      </div>
    </fish-layout>

    <edit-database-item-modal />

    <vue-progress-bar />
  </div>
</template>

<script>
import AppMenu from './components/AppMenu.vue';
import EditDatabaseItemModal from './components/EditDatabaseItemModal.vue';

export default {
  components: {
    AppMenu,
    EditDatabaseItemModal,
  },
  data() {
    return {
      isMenuVisible: true,
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuVisible = !this.isMenuVisible;
    },
  },
};
</script>

<style>
  .fish.layout > .header {
    padding: 0;
  }

  .fish.layout .has-sider > .content {
    margin: 20px;
    padding: 0.7em 1em;
  }

  .fish.layout .logo {
    padding: 1em;
  }

  .logo {
    padding: 0.7em .8em;
    font-weight: bold;
    font-size: 1.2rem;
  }
</style>
