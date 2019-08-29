<template>
  <div style="margin-top: 25px;">
    <div style="display: flex; flex-flow: row nowrap; align-items: center;">
      <h2 style="margin: 15px 0; flex-grow: 1;">{{ db.name }}</h2>

      <fish-switch
        v-model="workMode"
        :yesOrNo="['hash', 'key']">Hash Search Mode</fish-switch>
    </div>

    <div style="display: flex; flex-flow: row nowrap;">
      <fish-input
        v-show="workMode == 'hash'"
        style="flex-grow: 1; margin-right: 5px;"
        icon="fa fa-key"
        size="medium"
        v-model="hash" />

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
        @change="onChange"
        simple />
    </div>

    <div>
      <span>Total Item count: {{ db.keys }}</span>
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
  props: ['db'],
  data() {
    return {
      TableRowOptions,
      TableExpandView,
      workMode: 'key',
      hash: '',
      searchText: '*',
      columns: [
        { title: 'Key', key: 'key' },
        {
          title: '',
          render: (h, record) => h(TableRowOptions, {
            props: { db: this.db, record },
            on: { change: this.updateData },
          }),
        },
      ],
      rowsPerPage: 10,
      page: 1,
      results: [],
      cursors: [0],
      isLoading: false,
    };
  },
  created() {
    this.updateData();
  },
  mounted() {
    console.log(this.$refs.table);
  },
  watch: {
    searchText() {
      this.page = 1;

      this.resetData();
      this.updateData();
    },
    workMode() {
      this.page = 1;

      this.resetData();
      this.updateData();
    },
    hash(value) {
      if (value !== undefined && value.length !== 0) {
        this.page = 1;

        this.resetData();
        this.updateData();
      }
    },
  },
  methods: {
    onChange(page) {
      this.page = page;

      this.updateData();
    },
    resetData() {
      this.cursors = [0];
      this.results = [];
    },
    refreshData() {
      this.resetData();

      this.updateData();
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
      if (this.workMode === 'hash') {
        if (this.hash === undefined || this.hash.length === 0) return Promise.resolve(true);

        return this.$network
          .fetchPageWithHash({
            db: this.db.id, search: this.searchText, page: this.page, hash: this.hash,
          }).then(({ results }) => {
            this.results = results;
          });
      }

      return this.$network
        .fetchPage({
          db: this.db.id, search: this.searchText, page: this.page,
        })
        .then(({ results }) => {
          this.results = results;
        });
    },
  },
  computed: {
    ...mapGetters(['isSettingsFilled']),
    hasMore() {
      return this.cursors.length === 1 || this.cursors[this.cursors.length - 1] !== 0;
    },
    totalItemCount() {
      return this.hasMore ? this.db.keys : this.rowsPerPage * (this.cursors.length - 1);
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
