<template>
  <div>
    <div>
      <h3>Settings</h3>
    </div>

    <div style="margin-top: 20px; max-width: 400px">
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
            label="Username"
            style="width: 100%"
            name="username">
            <fish-input v-model="username"></fish-input>
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

        <fish-button type="primary" @click="submit">Save</fish-button>
      </fish-form>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      serverURL: this.$store.state.settings.serverURL,
      username: this.$store.state.settings.username,
      password: this.$store.state.settings.password,
    };
  },
  methods: {
    ...mapMutations(['saveSettings']),
    submit() {
      this.saveSettings({
        serverURL: this.serverURL,
        username: this.username,
        password: this.password,
      });

      this.$message.success('Saved!');
    },
  },
};
</script>
