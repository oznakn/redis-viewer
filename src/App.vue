<template>
  <div>
    <fish-layout sider="l">
      <nav slot="header">
        <div class="logo">Redis UI</div>
      </nav>

      <div slot="sider">
        <app-menu></app-menu>
      </div>

      <div slot="content" style="height: 100vh;">
        <router-view></router-view>
      </div>

      <div slot="footer">2017@copyright myliang</div>

    </fish-layout>

    <vue-progress-bar />
  </div>
</template>

<script>
import AppMenu from './components/AppMenu.vue';

export default {
  components: {
    AppMenu,
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
