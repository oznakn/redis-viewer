export default class Socket {
  static init($root) {
    this.$root = $root;
    this.$eventBus = $root.$eventBus;

    this.isConnected = false;

    if (WebSocket === undefined) {
      this.$root.$message.error('WebSocket not supported on your browser');
    } else {
      this.update();
    }
  }

  static update() {
    if (this.conn === undefined && this.$root.$store.state.settings.serverURL) {
      this.conn = new WebSocket('ws://localhost:5000/ws');

      this.conn.onclose = () => {
        this.isConnected = false;
        this.emitSocketStatus();
      };

      this.conn.onerror = () => {
        this.isConnected = false;
        this.emitSocketStatus();
      };

      this.conn.onmessage = (e) => {
        if (e.data === 'pong') {
          this.isConnected = true;
          this.emitSocketStatus();
        } else {
          this.$eventBus.$emit('updateDatabase', { db: Number(e.data) });
        }
      };
      this.conn.onopen = () => {
        this.conn.send('ping');
      };
    }
  }

  static emitSocketStatus() {
    this.$eventBus.$emit('socketStatusChanged', { isConnected: this.isConnected });
  }
}
