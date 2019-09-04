import axios from 'axios';

export default class Network {
  static init($root) {
    this.$root = $root;

    this.update();
  }

  static update() {
    this.conn = axios.create({
      baseURL: this.$root.$store.state.settings.serverURL,
      headers: {
        Authorization: this.$root.$store.state.settings.password,
      },
    });

    this.connInit();
  }

  static connInit() {
    this.conn.interceptors.request.use((config) => {
      this.$root.$Progress.start();
      return config;
    });

    this.conn.interceptors.response.use((response) => {
      this.$root.$Progress.finish();
      return response;
    });
  }

  static axiosResponseHandler(response) {
    return response.data;
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
        params: {
          db, key, value, hash,
        },
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
}
