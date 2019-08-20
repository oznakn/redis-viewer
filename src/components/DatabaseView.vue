<template>
  <div>
    <div class="container-header">
      <fish-input
        class="input"
        icon="fa fa-search"
        size="medium"
        v-model="searchText" />

      <fish-pagination
        class="pagination"
        :total="totalItem"
        :current="page"
        @change="onChange"
        simple />
    </div>

    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
      <fish-button type="positive" @click="refreshData"><i class="fa fa-sync"></i></fish-button>
    </div>

    <div style="margin-top: 20px;">
      <fish-table
        :columns="columns"
        :data="searchResults" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import AppTableRow from './AppTableRow.vue';

export default {
  props: ['db'],
  data() {
    return {
      searchText: '*',
      columns: [
        { title: 'Key', key: 'key' },
        {
          title: '',
          render: (h, record) => h(AppTableRow, { props: { record } }),
        },
      ],
      rowsPerPage: 10,
      page: 1,
      hasMore: true,
      maxPage: -1,
      result: {
        keys: [],
        values: {},
      },
      cursors: [0],
    };
  },
  created() {
    this.$network.createDBClient({ db: this.db })
      .then(() => this.updateData());
  },
  watch: {
    searchText() {
      this.page = 1;
      this.cursors = [0];
      this.result.keys = [];
      this.result.values = {};

      this.updateData();
    },
  },
  methods: {
    onChange(page) {
      this.page = page;

      this.updateData();
    },
    refreshData() {
      this.cursors.pop();
      this.hasMore = true;
      this.maxPage = -1;

      this.updateData();
    },
    updateData() {
      if (this.isSettingsFilled && this.hasMore) {
        this.fetchKeys()
          .catch(() => {
            this.$message.error('Unkown error!');
          });
      }
    },
    fetchKeys() {
      return this.$network.fetchKeys({ search: this.searchText, cursor: this.cursor })
        .then(({ cursor, keys }) => {
          this.result.keys = keys;
          this.cursors.push(cursor);

          this.result.values = {};

          if (Number(cursor) === 0) {
            this.hasMore = false;
            this.maxPage = this.page;
          }
        });
    },
  },
  computed: {
    ...mapGetters(['isSettingsFilled']),
    searchResults() {
      return this.result.keys
        .map((k) => ({ key: k }));
    },
    cursor() {
      return this.cursors[this.page - 1];
    },
    totalItem() {
      return this.hasMore ? this.rowsPerPage * (this.page + 1) : this.rowsPerPage * this.maxPage;
    },
  },
};
</script>

<style lang="scss" scoped>
  .container-header {
    display: flex;
    flex-flow: row nowrap;
  }

  .input {
    flex-grow: 1;
    margin-right: 5px;
  }

  .pagination {
    margin-left: 5px;
  }
</style>
