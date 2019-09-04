<template>
  <fish-modal :title="'Settings'" :visible.sync="isModalVisible">
    <fish-form>
      <fish-fields>
        <fish-field
          label="ServerURL"
          name="serverURL"
          style="width: 100%"
          :rules="[{ required: true, message: 'Server URL cannot be empty'}]">
          <fish-input v-model="serverURL"></fish-input>
        </fish-field>
      </fish-fields>

      <fish-fields>
        <fish-field
          label="Password"
          style="width: 100%"
          name="password">
          <fish-input type="password" v-model="password"></fish-input>
        </fish-field>
      </fish-fields>

      <fish-button type="primary" @click="save">Save</fish-button>
    </fish-form>
  </fish-modal>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      isModalVisible: false,
      serverURL: this.$store.state.settings.serverURL,
      password: this.$store.state.settings.password,
    };
  },
  created() {
    this.$eventBus.$on('openSettingsModal', this.showModal);
  },
  mounted() {
    this.$eventBus.$emit('settingsModalReady');
  },
  beforeDestroy() {
    this.$eventBus.$off('openSettingsModal', this.showModal);
  },
  methods: {
    ...mapMutations(['saveSettings']),
    showModal() {
      this.isModalVisible = true;
    },
    save() {
      if (this.serverURL.indexOf('http') !== 0) {
        this.serverURL = `http://${this.serverURL}`;
      }

      if (this.serverURL[this.serverURL.length - 1] !== '/') {
        this.serverURL += '/';
      }

      this.saveSettings({
        serverURL: this.serverURL,
        password: this.password,
      });

      this.$message.success('Saved!');

      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
  },
};
</script>
