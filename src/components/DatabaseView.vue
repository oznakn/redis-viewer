<template>
  <div>
    <div style="margin: 15px 0;">
      <h2>{{ db.name }}</h2>

      <h4 v-show="hash">Hash key: {{ hash }}</h4>
    </div>

    <div style="display: flex; flex-flow: row nowrap;">
      <fish-input
        style="flex-grow: 1; margin-right: 5px;"
        icon="fa fa-search"
        size="medium"
        v-model="searchText" />

      <fish-button style="margin: 0 8px" type="positive" @click="refreshData">
        <i class="fa fa-sync"></i>
      </fish-button>

      <fish-pagination
        style="margin-left: 5px;"
        :total="totalItemCount"
        :current="page"
        @change="onPageChange"
        simple />
    </div>

    <div>
      <div>Total Item count: {{ db.keys }}</div>
      <div>Last Fetch Time:
        <template v-if="fetchTime">{{ new Date(fetchTime).toLocaleString() }}</template>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <fish-table
        :columns="columns"
        :data="results"
        :loading="isLoading"
        ref="table"
        :expandedRowRender="(h, record) => {
          if (record.type === 'hash') return undefined;

          return h(TableExpandView, { props: { record, db, hash } })
        }" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import TableRowOptions from './TableRowOptions.vue';
import TableExpandView from './TableExpandView.vue';

export default {
  props: {
    db: {
      type: Object,
      required: true,
    },
    workMode: {
      type: String,
      default: 'key',
    },
    hash: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      TableRowOptions,
      TableExpandView,
      searchText: '*',
      columns: [
        { title: 'Key', key: 'key' },
        {
          title: '',
          render: (h, record) => h(TableRowOptions, {
            props: { db: this.db, record, hash: this.hash },
            on: { change: this.onItemDelete },
          }),
        },
      ],
      rowsPerPage: 10,
      page: 1,
      results: [],
      hasMore: true,
      isLoading: false,
      fetchTime: undefined,
    };
  },
  created() {
    this.updateData();

    this.$eventBus.$on('updateDatabase', this.onUpdateDatabaseEvent);
  },
  beforeDestroy() {
    this.$eventBus.$off('updateDatabase', this.onUpdateDatabaseEvent);
  },
  watch: {
    searchText() {
      this.page = 1;

      this.resetData();
      this.updateData();
    },
    db() {
      this.page = 1;

      this.resetData();
      this.updateData();
    },
  },
  methods: {
    onPageChange(page) {
      this.page = page;

      this.updateData();
    },
    onItemDelete() {
      this.updateData();
      this.updateDBInfo();
    },
    onUpdateDatabaseEvent({ db }) {
      if (db === this.db.id) {
        this.refreshData();
      }
    },
    resetData() {
      this.results = [];
    },
    refreshData() {
      this.resetData();

      this.updateData();
      this.updateDBInfo();
    },
    updateDBInfo() {
      this.$network
        .fetchDBSize({
          db: this.db.id,
        })
        .then(({ size }) => {
          this.db.keys = size;
        })
        .catch(() => {
          this.$message.error('Unkown error!');
        });
    },
    updateData() {
      if (this.isSettingsFilled && this.hasMore) {
        this.isLoading = true;

        this.fetchPage()
          .catch(() => {
            this.$message.error('Unkown error!');
          })
          .then(() => {
            this.isLoading = false;
          });
      }
    },
    fetchPage() {
      if (this.workMode === 'hash' && (this.hash === undefined || this.hash.length === 0)) return Promise.resolve(true);

      return this.$network
        .fetchPage({
          db: this.db.id, search: this.searchText, page: this.page, hash: this.workMode === 'hash' ? this.hash : undefined,
        })
        .then(({ results, time }) => {
          this.fetchTime = time;
          this.results = results;

          if (results.length === 0) this.hasMore = false;
        });
    },
  },
  computed: {
    ...mapGetters(['isSettingsFilled']),
    totalItemCount() {
      return this.hasMore ? this.db.keys : this.rowsPerPage * (this.page - 1);
    },
  },
};
</script>

<style lang="scss">
  .fish.pagination .item.total {
    display: none;
    visibility: hidden;
  }
</style>
