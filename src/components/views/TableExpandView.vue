<template>
 <div>
    <div v-if="this.record.type != 'hash'" style="display: flex; flex-flow: row nowrap;">
      <div style="flex-grow: 1; margin-left: 10px;">
        <template v-if="!isLoading">
          <vue-json-pretty :deep="'1'" :show-line="false" :data="value.data"/>
        </template>

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

    <div v-else>
      <fish-button
        size="small"
        style="margin-right: 30px"
        @click="openHashSearchModal">
        <i class="fas fa-eye"></i>
      </fish-button>
    </div>
 </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  props: ['db', 'record', 'hash'],
  components: {
    VueJsonPretty,
  },
  data() {
    return {
      value: undefined,
      isLoading: false,
    };
  },
  created() {
    if (this.record.value === undefined) {
      this.refreshData();
    } else {
      this.value = this.tryJSON(this.record.value);
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
          hash: this.record.type === 'hashKey' ? this.hash : undefined,
        })
        .then(({ result }) => {
          this.value = this.tryJSON(result);
        });
    },
    openHashSearchModal() {
      this.$eventBus.$emit('openHashSearchView', { db: this.db, hash: this.record.key });
    },
    tryJSON(data) {
      try {
        const parsed = JSON.parse(data);

        return { data: parsed };
      } catch (e) {
        return { data };
      }
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
