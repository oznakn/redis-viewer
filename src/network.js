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
        Authentication: this.$root.$store.state.settings.password,
      },
    });
    console.log(this.$root.$store.state.settings.password);

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
      .get(`/dbs/${encodeURIComponent(db)}/size`)
      .then(this.axiosResponseHandler);
  }

  static fetchPage({ db, search, page }) {
    return this.conn
      .get(`/dbs/${encodeURIComponent(db)}/search/${encodeURIComponent(search)}?page=${encodeURIComponent(page)}`)
      .then(this.axiosResponseHandler);
  }

  static fetchPageWithHash({
    db, search, page, hash,
  }) {
    return this.conn
      .get(`/dbs/${encodeURIComponent(db)}/hash/${encodeURIComponent(hash)}/search/${encodeURIComponent(search)}?page=${encodeURIComponent(page)}`)
      .then(this.axiosResponseHandler);
  }

  static fetchCursor({ db, search, cursor }) {
    return this.conn
      .get(`/dbs/${encodeURIComponent(db)}/cursor/${encodeURIComponent(search)}/${encodeURIComponent(cursor)}`)
      .then(this.axiosResponseHandler);
  }

  static fetchKeys({ db, search, cursor }) {
    return this.conn
      .get(`/dbs/${encodeURIComponent(db)}/scan/${encodeURIComponent(search)}/${encodeURIComponent(cursor)}`)
      .then(this.axiosResponseHandler);
  }

  static deleteKey({ db, key }) {
    return this.conn
      .delete(`/dbs/${encodeURIComponent(db)}/keys/${encodeURIComponent(key)}`)
      .then(this.axiosResponseHandler);
  }

  static deleteKeyWithHash({ db, key, hash }) {
    return this.conn
      .delete(`/dbs/${encodeURIComponent(db)}/hash/${encodeURIComponent(hash)}/keys/${encodeURIComponent(key)}`)
      .then(this.axiosResponseHandler);
  }

  static deleteAllKeysWithHash({ db, hash }) {
    return this.conn
      .delete(`/dbs/${encodeURIComponent(db)}/hash/${encodeURIComponent(hash)}/keys`)
      .then(this.axiosResponseHandler);
  }

  static setKey({ db, key, value }) {
    return this.conn
      .post(`/dbs/${encodeURIComponent(db)}/keys/${encodeURIComponent(key)}`, { value })
      .then(this.axiosResponseHandler);
  }

  static setKeyWithHash({
    db, key, hash, value,
  }) {
    return this.conn
      .post(`/dbs/${encodeURIComponent(db)}/hash/${encodeURIComponent(hash)}/keys/${encodeURIComponent(key)}`, { value })
      .then(this.axiosResponseHandler);
  }

  static getKey({ db, key }) {
    return this.conn
      .get(`/dbs/${encodeURIComponent(db)}/keys/${encodeURIComponent(key)}`)
      .then(this.axiosResponseHandler);
  }

  static getKeyWithHash({ db, key, hash }) {
    return this.conn
      .get(`/dbs/${encodeURIComponent(db)}/hash/${encodeURIComponent(hash)}/keys/${encodeURIComponent(key)}`)
      .then(this.axiosResponseHandler);
  }
}
