<template>
  <div>
    <fish-menu
      mode="horizontal"
      size="large"
      @change="onDBChange"
      default-active="0"
      ref="menu">

      <fish-option
        v-for="(db, index) in dbs"
        :index="`${index}`"
        :content="db['name']"
        :key="db['id']" />
    </fish-menu>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  mounted() {
    this.updateDBs();
  },
  methods: {
    ...mapMutations(['setDBs']),
    updateDBs() {
      this.$network.getDBs()
        .then(({ results }) => {
          this.setDBs(results);

          if (this.dbs.length > 0) {
            this.$eventBus.$emit('changeDBView', { db: this.dbs[0] });
          }
        })
        .catch(() => {
          if (this.isSettingsFilled === true) {
            this.$message.error('Unknown Error!');
          }
        });
    },
    onDBChange(dbIndex) {
      this.$refs.menu.$children.forEach((child) => {
        child.active = false;
      });
      this.$refs.menu.setActive(dbIndex);

      this.$eventBus.$emit('changeDBView', { db: this.dbs[dbIndex] });
    },
  },
  computed: {
    ...mapState(['dbs']),
  },
};
</script>
