<template>
  <div class="container">

    <fish-button v-if="record.type == 'hash'" size="small" @click="openHashSearchModal">
      <i class="fa fa-eye"></i>
    </fish-button>

    <template v-else-if="hasFullAccess">
      <fish-button size="small" @click="openEditDatabaseItemModal">
        <i class="fa fa-pen"></i>
      </fish-button>
    </template>

    <fish-button v-if="hasFullAccess" type="negative" size="small" @click="deleteKey">
      <i class="fa fa-times"></i>
    </fish-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

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
      return this.$network
        .deleteKey({
          db: this.db.id,
          key: this.record.key,
          hash: this.record.type === 'hashKey' ? this.hash : undefined,
        })
        .then(() => {
          this.$message.success('Success!');

          this.$emit('change');
        })
        .catch(() => {
          this.$message.error('Unkown error!');
        });
    },
  },
  computed: {
    ...mapGetters(['hasFullAccess']),
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
