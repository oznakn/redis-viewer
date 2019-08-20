<template>
  <div>
    <database-view></database-view>
  </div>
</template>

<script>
import DatabaseView from '../components/DatabaseView.vue';

export default {
  components: {
    DatabaseView,
  },
  created() {
    this.$network.getDBs()
      .then((response) => {
        console.log(response);
      })
      .catch(() => {
        this.$message.error('Unknown Error!');
      });
  },
};
</script>
