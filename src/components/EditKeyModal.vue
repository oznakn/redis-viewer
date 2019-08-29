<template>
  <fish-modal :title="`Key: ${record.key}`" :visible.sync="isModalVisible">
    <fish-form>
      <fish-fields>
        <fish-field label="Value: " span="eight">
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
      hash: undefined,
      value: '',
    };
  },
  created() {
    this.$eventBus.$on('openEditKeyModal', this.showModal);
  },
  beforeDestroy() {
    this.$eventBus.$off('openEditKeyModal', this.showModal);
  },
  methods: {
    showModal({ db, record, hash }) {
      this.db = db;
      this.record = record;
      this.hash = hash;
      this.isModalVisible = true;

      if (this.record.type === undefined) {
        this.$network
          .getKeyWithHash({
            db: this.db.id,
            key: this.record.key,
            hash: this.hash,
          })
          .then((response) => {
            this.value = response;
          })
          .catch(() => {
            this.$message.error('Unkown error!');
          });
      } else {
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
      }
    },
    save() {
      if (this.record.type === undefined) {
        this.$network
          .setKeyWithHash({
            db: this.db.id, key: this.record.key, value: this.value, hash: this.hash,
          })
          .then(() => {
            this.isModalVisible = false;

            this.$message.success('Success!');
          })
          .catch(() => {
            this.$message.error('Unkown error!');
          });
      } else {
        this.$network
          .setKey({ db: this.db.id, key: this.record.key, value: this.value })
          .then(() => {
            this.isModalVisible = false;

            this.$message.success('Success!');
          })
          .catch(() => {
            this.$message.error('Unkown error!');
          });
      }
    },
  },
};
</script>
