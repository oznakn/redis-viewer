<template>
  <div>
    <fish-layout>
      <nav slot="header" style="display: flex; flex-flow: row nowrap;">
        <div class="logo">
          Redis UI
        </div>

        <app-menu></app-menu>
        <database-picker v-if="$route.path === '/'" style="margin-left: 40px"></database-picker>
      </nav>

      <div slot="content" style="min-height: 100vh; padding: 10px 40px 40px 40px;">
        <router-view></router-view>
      </div>
    </fish-layout>

    <edit-key-modal />

    <vue-progress-bar />
  </div>
</template>

<script>
import AppMenu from './components/AppMenu.vue';
import DatabasePicker from './components/DatabasePicker.vue';
import EditKeyModal from './components/EditKeyModal.vue';

export default {
  components: {
    AppMenu,
    EditKeyModal,
    DatabasePicker,
  },
};
</script>

<style>
  .logo {
    padding: .75em;
    font-weight: bold;
    font-size: 1.2rem;
  }
</style>
