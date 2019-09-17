<template>
  <fish-modal :title="'Settings'" :visible.sync="isModalVisible">
    <fish-form>
      <fish-field
        label="ServerURL"
        name="serverURL"
        style="width: 100%"
        :rules="[{ required: true, message: 'Server URL cannot be empty'}]">
        <fish-input v-model="settings.serverURL"></fish-input>
      </fish-field>

      <fish-field
        label="Username"
        style="width: 100%"
        name="username">
        <fish-input type="text" v-model="settings.username"></fish-input>
      </fish-field>

      <fish-field
        label="Password"
        style="width: 100%"
        name="password">
        <fish-input type="password" v-model="settings.password"></fish-input>
      </fish-field>

      <fish-button type="primary" @click="save">Save</fish-button>
    </fish-form>
  </fish-modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      isModalVisible: false,
    };
  },
  created() {
    this.$eventBus.$on('openSettingsModal', this.showModal);
    this.$eventBus.$on('closeModals', this.onCloseModalsEvent);
  },
  mounted() {
    this.$eventBus.$emit('settingsModalReady');
  },
  beforeDestroy() {
    this.$eventBus.$off('openSettingsModal', this.showModal);
    this.$eventBus.$off('closeModals', this.onCloseModalsEvent);
  },
  methods: {
    ...mapActions(['saveSettings']),
    showModal() {
      this.isModalVisible = true;
    },
    onCloseModalsEvent() {
      this.isModalVisible = false;
    },
    save() {
      if (this.settings.serverURL.indexOf('http') === 0) {
        this.settings.serverURL = this.settings.serverURL.substring(this.settings.serverURL.indexOf('/') + 2, this.settings.serverURL.length);
      }

      while (this.settings.serverURL[this.settings.serverURL.length - 1] === '/') {
        this.settings.serverURL = this.settings.serverURL.substring(0, this.settings.serverURL.length - 1);
      }

      this
        .saveSettings({
          ...this.settings,
        })
        .then(() => {
          this.$message.success('Saved!');

          setTimeout(() => {
            window.location.reload();
          }, 500);
        })
        .catch(() => {
          this.$message.error('Unknown Error!');
        });
    },
  },
  computed: {
    ...mapState(['settings']),
  },
};
</script>
