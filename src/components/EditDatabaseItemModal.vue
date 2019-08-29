<template>
  <fish-modal title="Welcome.." :visible.sync="isModalVisible">
    <fish-form>
      <fish-fields>
        <fish-field label="Value" span="eight">
          <fish-input type="textarea" style="height: 100px;" v-model="value"></fish-input>
        </fish-field>
      </fish-fields>

      <fish-button type="primary" @click="save">Submit</fish-button>
    </fish-form>
  </fish-modal>
</template>

<script>
export default {
  data() {
    return {
      isModalVisible: false,
      db: undefined,
      record: undefined,
      value: '',
    };
  },
  created() {
    this.$eventBus.$on('openEditDatabaseItemModal', this.showModal);
  },
  beforeDestroy() {
    this.$eventBus.$off('openEditDatabaseItemModal', this.showModal);
  },
  methods: {
    showModal({ db, record }) {
      this.db = db;
      this.record = record;
      this.isModalVisible = true;

      this.$network
        .getKey({
          db: this.db.id,
          key: this.record.key,
        })
        .then((response) => {
          this.value = response;
        })
        .catch(() => {
          this.$message.error('Unkown error!');
        });
    },
    save() {
      this.$network
        .setKey({ db: this.db.id, key: this.record.key, value: this.value })
        .then(() => {
          this.db = undefined;
          this.record = undefined;
          this.value = '';

          this.isModalVisible = false;

          this.$message.success('Success!');
        })
        .catch(() => {
          this.$message.error('Unkown error!');
        });
    },
  },
};
</script>
