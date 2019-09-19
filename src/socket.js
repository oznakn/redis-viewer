export default class Socket {
  static init($root) {
    this.$root = $root;
    this.$eventBus = $root.$eventBus;

    this.isConnected = false;

    if (WebSocket === undefined) {
      this.$root.$message.error('WebSocket not supported on your browser');
    }
  }

  static update() {
    if (this.isConnected === false && this.$root.$store.getters.serverURL.length > 0) {
      this.conn = new WebSocket(`ws://${this.$root.$store.getters.serverURL}/ws`);

      this.conn.onclose = this.conn.onerror = () => { // eslint-disable-line
        this.isConnected = false;
        this.emitSocketStatus();

        this.conn = undefined;
      };

      this.conn.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.stats === true) {
          this.$root.$store.commit('setStats', data.result);
        } else if (data.pong === true) {
          this.isConnected = true;
          this.emitSocketStatus();
        } else {
          this.$eventBus.$emit('updateDatabase', { db: data.db });
        }
      };

      this.conn.onopen = () => {
        this.conn.send('ping');
      };
    } else if (this.isConnected === true) {
      this.conn.close();

      setTimeout(() => {
        this.update();
      }, 400);
    }
  }

  static emitSocketStatus() {
    this.$eventBus.$emit('socketStatusChanged', { isConnected: this.isConnected });
  }
}
