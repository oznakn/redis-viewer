<template>
  <div class="container">
    <fish-button
      v-if="record.type == 'hash'"
      style="margin-right: 20px"
      size="small"
      :index="record.key"
      @click="openHashSearchModal">
      Hash
    </fish-button>

    <fish-button v-if="record.type != 'hash'" size="small" @click="openEditDatabaseItemModal">
      <i class="fa fa-pen"></i>
    </fish-button>

    <fish-button v-if="record.type != 'hash'" type="negative" size="small" @click="deleteKey">
      <i class="fa fa-times"></i>
    </fish-button>
  </div>
</template>

<script>
export default {
  props: {
    db: {
      type: Object,
      required: true,
    },
    record: {
      type: Object,
      required: true,
    },
    hash: {
      type: String,
      default: undefined,
    },
  },
  methods: {
    openEditDatabaseItemModal() {
      this.$eventBus.$emit('openEditKeyModal', { db: this.db, record: this.record, hash: this.hash });
    },
    openHashSearchModal() {
      this.$eventBus.$emit('openHashSearchView', { db: this.db, hash: this.record.key });
    },
    deleteKey() {
      if (this.record.type === undefined) {
        return this.$network
          .deleteKeyWithHash({ db: this.db.id, key: this.record.key, hash: this.hash })
          .then(() => {
            this.$message.success('Success!');

            this.$emit('change');
          })
          .catch(() => {
            this.$message.error('Unkown error!');
          });
      }

      return this.$network
        .deleteKey({ db: this.db.id, key: this.record.key })
        .then(() => {
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
