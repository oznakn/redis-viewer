<template>
  <fish-modal :visible.sync="isModalVisible">
    <fish-form>
      <fish-switch v-model="isHash">Enable hash key</fish-switch>

      <fish-field v-if="isHash" label="Hash: " span="eight">
        <fish-input v-model="hash"></fish-input>
      </fish-field>

      <fish-field label="Key: " span="eight">
        <fish-input v-model="key"></fish-input>
      </fish-field>

      <fish-field label="Value: " span="eight">
        <fish-input type="textarea" style="height: 100px;" v-model="value"></fish-input>
      </fish-field>

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
      hash: '',
      key: '',
      value: '',
      isHash: false,
    };
  },
  created() {
    this.$eventBus.$on('openNewKeyModal', this.showModal);
    this.$eventBus.$on('closeModals', this.closeModal);
  },
  beforeDestroy() {
    this.$eventBus.$off('openNewKeyModal', this.showModal);
    this.$eventBus.$off('closeModals', this.closeModal);
  },
  methods: {
    showModal({ db, hash }) {
      this.db = db;
      this.hash = hash;
      this.isModalVisible = true;
      if (hash) {
        this.isHash = true;
      }
    },
    closeModal() {
      this.db = undefined;
      this.hash = '';
      this.isModalVisible = false;
      this.isHash = false;
    },
    save() {
      return this.$network
        .setKey({
          db: this.db.id,
          key: this.key,
          value: this.value,
          hash: this.hash ? this.hash : undefined,
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
