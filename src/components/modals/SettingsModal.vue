<template>
  <fish-modal :title="'Settings'" :visible.sync="isModalVisible">
    <fish-form>
      <fish-field
        label="ServerURL"
        name="serverURL"
        style="width: 100%"
        :rules="[{ required: true, message: 'Server URL cannot be empty'}]">
        <fish-input v-model="serverURL"></fish-input>
      </fish-field>

      <fish-field
        label="Username"
        style="width: 100%"
        name="username">
        <fish-input type="text" v-model="username"></fish-input>
      </fish-field>

      <fish-field
        label="Password"
        style="width: 100%"
        name="password">
        <fish-input type="password" v-model="password"></fish-input>
      </fish-field>

      <fish-button type="primary" @click="save">Save and Login</fish-button>
    </fish-form>
  </fish-modal>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      isModalVisible: false,
      username: '',
      password: '',
      serverURL: this.$store.getters.serverURL,
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
    ...mapActions(['saveSettingsAndLogin']),
    showModal() {
      this.isModalVisible = true;
    },
    onCloseModalsEvent() {
      this.isModalVisible = false;
    },
    save() {
      if (this.serverURL.indexOf('http') === 0) {
        this.serverURL = this.serverURL.substring(this.serverURL.indexOf('/') + 2, this.serverURL.length);
      }

      while (this.serverURL[this.serverURL.length - 1] === '/') {
        this.serverURL = this.serverURL.substring(0, this.serverURL.length - 1);
      }

      this
        .saveSettingsAndLogin({
          serverURL: this.serverURL,
          username: this.username,
          password: this.password,
        })
        .then(() => {
          this.$message.success('Saved!');

          this.$eventBus.$emit('refreshSystem');
        })
        .catch(() => {
          this.$message.error('Server error or Wrong credentials!');
        });
    },
  },
};
</script>
