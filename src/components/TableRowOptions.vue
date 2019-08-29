<template>
  <div class="container">
    <fish-tag
      v-if="record.type == 'hash'"
      style="margin-right: 20px"
      :index="record.key">
      Hash
    </fish-tag>

    <fish-button size="tiny" @click="editKey">
      <i class="fa fa-pen"></i>
    </fish-button>

    <fish-button type="negative" size="tiny" @click="deleteKey">
      <i class="fa fa-times"></i>
    </fish-button>
  </div>
</template>

<script>
export default {
  props: ['db', 'record'],
  methods: {
    editKey() {
      this.$eventBus.$emit('openEditDatabaseItemModal', { db: this.db, record: this.record });
    },
    deleteKey() {
      return this.$network
        .deleteKey({ db: this.db.id, key: this.record.key })
        .then(() => {
          this.db.keys -= 1;

          this.$message.success('Success!');

          this.$emit('change');
        })
        .catch(() => {
          this.$message.error('Unkown error!');
        });
    },
  },
};
</script>

<style lang="scss" scoped>
  .container {
    text-align: right;

    &>* {
      margin-left: 5px;
      margin-right: 5px;
    }
  }
</style>
