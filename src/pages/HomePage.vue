<template>
  <div>
    <!-- <div>
      <fish-button type="positive" @click="updateDBs">
        <i class="fa fa-sync"></i>
      </fish-button>
    </div> -->

    <fish-tabs v-if="dbs.length > 0" :value="dbs[0]['name']">
      <fish-tab-pane
        v-for="db in dbs"
        :label="db['name']"
        :index="db['name']"
        :key="db['id']">

        <database-view :db="db"></database-view>
      </fish-tab-pane>
    </fish-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import DatabaseView from '../components/DatabaseView.vue';

export default {
  components: {
    DatabaseView,
  },
  data() {
    return {
      dbs: [],
    };
  },
  created() {
    this.updateDBs();
  },
  methods: {
    updateDBs() {
      this.$network.getDBs()
        .then((response) => {
          this.dbs = response;
        })
        .catch(() => {
          if (this.isSettingsFilled === true) {
            this.$message.error('Unknown Error!');
          }
        });
    },
  },
  computed: {
    ...mapGetters(['isSettignsFilled']),
  },
};
</script>
