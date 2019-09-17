<template>
  <fish-modal v-if="record" :title="`Key: ${record.key}`" :visible.sync="isModalVisible">
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
    this.$eventBus.$on('closeModals', this.closeModal);
  },
  beforeDestroy() {
    this.$eventBus.$off('openEditKeyModal', this.showModal);
    this.$eventBus.$off('closeModals', this.closeModal);
  },
  methods: {
    showModal({ db, record, hash }) {
      this.db = db;
      this.record = record;
      this.hash = hash;
      this.isModalVisible = true;


      return this.$network
        .getKey({
          db: this.db.id,
          key: this.record.key,
          hash: this.record.type === 'hashKey' ? this.hash : undefined,
        })
        .then(({ result }) => {
          this.value = result;
        })
        .catch(() => {
          this.$message.error('Unkown error!');
        });
    },
    closeModal() {
      this.db = undefined;
      this.record = undefined;
      this.hash = undefined;
      this.value = '';
      this.isModalVisible = false;
    },
    save() {
      return this.$network
        .setKey({
          db: this.db.id,
          key: this.record.key,
          value: this.value,
          hash: this.record.type === 'hashKey' ? this.hash : undefined,
        })
        .then(() => {
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
