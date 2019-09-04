<template>
  <div class="container">
    <div v-if="record.type == 'hash'" class="info-tag" style="margin-right: 30px">
      Hash
    </div>

    <fish-button v-if="record.type == 'hash'" size="small" @click="openHashSearchModal">
      <i class="fa fa-pen"></i>
    </fish-button>

    <fish-button v-else size="small" @click="openEditDatabaseItemModal">
      <i class="fa fa-pen"></i>
    </fish-button>

    <fish-button type="negative" size="small" @click="deleteKey">
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

  .info-tag {
    display: inline-block;

    border-radius: 2px;
    line-height: 1em;
    min-height: 1em;

    white-space: nowrap;
    text-align: center;

    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.75em 1em;

    color: rgba(0, 0, 0, 0.6);
    background: rgb(238, 239, 240);
    font-family: "Lato", "proxima-nova", "Helvetica Neue", Arial, sans-serif;
    outline: none;
    vertical-align: baseline;
  }
</style>
