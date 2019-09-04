<template>
  <div style="display: flex; flex-flow: row nowrap;">
    <div style="flex-grow: 1; margin-left: 10px;">
      <template v-if="!isLoading">{{ value }}</template>
      <span v-else style="color: #aaa">
        Loading...
      </span>
    </div>

    <div style="margin-right: 5px;">
      <fish-button type="positive" size="tiny" @click="refreshData">
        <i class="fa fa-sync"></i>
      </fish-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['db', 'record', 'hash'],
  data() {
    return {
      value: this.record.value,
      isLoading: false,
    };
  },
  created() {
    if (this.value === undefined) {
      this.refreshData();
    }
  },
  methods: {
    refreshData() {
      this.isLoading = true;

      this.fetchData()
        .catch(() => {
          this.$message.error('Unkown error!');
        })
        .then(() => {
          this.isLoading = false;
        });
    },
    fetchData() {
      if (this.record.type === 'hash') return Promise.resolve('true');

      return this.$network
        .getKey({
          db: this.db.id,
          key: this.record.key,
          hash: this.record.type === undefined ? this.hash : undefined,
        })
        .then(({ result }) => {
          this.value = result;
        });
    },
  },
};
</script>

<style lang="scss">
  .hide-expand {
    .fa.fa-angle-right {
      display: none;
      visibility: hidden;
    }
  }
</style>
