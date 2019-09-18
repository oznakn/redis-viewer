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
    this.isConnected = false;

    if (this.conn === undefined && this.$root.$store.getters.serverURL) {
      this.conn = new WebSocket(`ws://${this.$root.$store.getters.serverURL}/ws`);

      this.conn.onclose = this.conn.onerror = () => { // eslint-disable-line
        this.isConnected = false;
        this.emitSocketStatus();

        this.conn = undefined;
        this.update();
      };

      this.conn.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.pong === true) {
          this.isConnected = true;
          this.emitSocketStatus();
        } else {
          this.$eventBus.$emit('updateDatabase', { db: data.db });
        }
      };

      this.conn.onopen = () => {
        this.conn.send('ping');
      };
    } else if (this.conn !== undefined) {
      this.conn.close();
    }
  }

  static emitSocketStatus() {
    this.$eventBus.$emit('socketStatusChanged', { isConnected: this.isConnected });
  }
}
