import axios from 'axios';

export default class Network {
  static init($root) {
    this.$root = $root;

    this.update();
  }

  static update() {
    this.conn = axios.create({
      baseURL: this.fixURL(this.$root.$store.state.settings.serverURL),
      headers: {
        Authorization: `Bearer ${this.$root.$store.state.accessKey}`,
      },
    });

    this.connInit();
  }

  static connInit() {
    this.conn.interceptors.request.use((config) => {
      if (config.url.indexOf('/memory') === -1) {
        this.$root.$Progress.start();
      }

      return config;
    });

    this.conn.interceptors.response.use((response) => {
      this.$root.$Progress.finish();
      return response;
    });
  }

  static fixURL(url) {
    if (url.indexOf('http') !== 0) {
      url = `http://${url}`;
    }

    if (url[url.length - 1] !== '/') {
      url += '/';
    }
    return url;
  }

  static axiosResponseHandler(response) {
    return response.data;
  }

  static login({ username, password }) {
    return this.conn
      .post('/login', { username, password })
      .then(this.axiosResponseHandler);
  }

  static getDBs() {
    return this.conn
      .get('/dbs')
      .then(this.axiosResponseHandler);
  }

  static fetchDBSize({ db }) {
    return this.conn
      .get('/dbsize', {
        params: { db },
      })
      .then(this.axiosResponseHandler);
  }

  static fetchPage({
    db, search, page, hash,
  }) {
    return this.conn
      .get('/search', {
        params: {
          db, search, page, hash,
        },
      })
      .then(this.axiosResponseHandler);
  }

  static deleteKey({ db, key, hash }) {
    return this.conn
      .delete('/key', {
        params: { db, key, hash },
      })
      .then(this.axiosResponseHandler);
  }

  static setKey({
    db, key, value, hash,
  }) {
    return this.conn
      .post('/key', {
        db, key, value, hash,
      })
      .then(this.axiosResponseHandler);
  }

  static getKey({ db, key, hash }) {
    return this.conn
      .get('/key', {
        params: {
          db, key, hash,
        },
      })
      .then(this.axiosResponseHandler);
  }

  static sendCommand({ db, command }) {
    return this.conn
      .post('/command', {
        command,
      },
      {
        params: {
          db,
        },
      })
      .then(this.axiosResponseHandler);
  }

  static getRedisStats() {
    return this.conn
      .get('/stats')
      .then(this.axiosResponseHandler);
  }
}
