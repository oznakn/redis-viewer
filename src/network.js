import axios from 'axios';

export default class Network {
  static init($root) {
    this.$root = $root;

    this.conn = axios.create({
      baseURL: this.$root.$store.state.settings.serverURL,
    });

    this.connInit();
  }

  static update() {
    this.conn = axios.create({
      baseURL: this.$root.$store.state.settings.serverURL,
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
    if (response.data.success !== true) {
      return Promise.reject(new Error('failed'));
    }

    return response.data.value;
  }

  static getDBs() {
    return this.conn
      .get('/dbs')
      .then(this.axiosResponseHandler)
      .then((response) => {
        const values = response.split('\r\n');

        return values
          .slice(1, values.length - 1)
          .map((item) => {
            const items = item.split(':');

            const result = {
              name: items[0],
            };

            items[1].split(',').forEach((kv) => {
              const [k, v] = kv.split('=');

              result[k] = v;
            });

            return result;
          });
      });
  }

  static createDBClient({ db }) {
    return this.conn
      .post(`/db/${db}`)
      .then(this.axiosResponseHandler);
  }

  static fetchKeys({ search, cursor }) {
    return this.conn
      .get(`/scan?cursor=${encodeURIComponent(cursor)}&search=${encodeURIComponent(search)}`)
      .then(this.axiosResponseHandler)
      .then((response) => ({ cursor: Number(response[0]), keys: response[1] }));
  }

  static getKeyValue({ key }) {
    return this.conn
      .get(`/key/${encodeURIComponent(key)}`)
      .then(this.axiosResponseHandler);
  }
}
