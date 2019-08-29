<template>
  <div>
    <fish-menu
      mode="inline"
      size="large"
      @change="onChange"
      default-active="0"
      ref="menu">

      <fish-option index="0" content="Main Page"></fish-option>
      <fish-option index="1" content="Settings"></fish-option>
    </fish-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      activeMenuItem: 0,
    };
  },
  mounted() {
    if (this.isSettingsFilled === false) {
      this.changeMenu(1);
    }

    this.fixMenu(this.activeMenuItem);

    this.$eventBus.$on('changeMenu', this.changeMenu);
  },
  beforeDestroy() {
    this.$eventBus.$off('changeMenu', this.changeMenu);
  },
  methods: {
    fixMenu(index) {
      if (index === 0 && this.$route.path !== '/') {
        this.$router.push({ path: '/' });
      } else if (this.$route.path === '/') {
        this.$refs.menu.setActive('0');
      } else if (index === 1 && this.$route.path !== '/settings') {
        this.$router.push({ path: '/settings' });
      } else if (this.$route.path === '/settings') {
        this.$refs.menu.setActive('1');
      }
    },
    changeMenu(index) {
      if (index === 0) {
        this.$router.push({ path: '/' });
      } else if (index === 1) {
        this.$router.push({ path: '/settings' });
      }

      this.activeMenuItem = index;
      this.fixMenu(this.activeMenuItem);
    },
    onChange(index) {
      this.changeMenu(Number(index));
    },
  },
  computed: {
    ...mapGetters(['isSettingsFilled']),
  },
};
</script>
