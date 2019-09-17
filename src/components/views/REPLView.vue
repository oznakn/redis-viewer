<template>
  <div>
    <div class="repl-bg-overlay"
      :class="{'visible': isVisible}"
      @click="isVisible = false"></div>

    <div class="repl" :class="{'visible': isVisible}">
      <fish-card fluid>
        <span class="repl-close-button" @click="closeView">
          <i class="fa fa-lg fa-times"></i>
        </span>

        <div class="repl-items" ref="replItems">
          <div class="repl-item" v-for="(item, index) in items" :key="index">
            <template v-if="item.type == 'i'" >
              <i class="fas fa-angle-right"></i>
              {{ item.data }}
            </template>

            <template v-else>
              <vue-json-pretty :deep="'1'" :show-line="false" :data="item.data"/>
            </template>
          </div>
        </div>

        <div class="bottom">
          <div class="info">
            <span v-if="db">{{db.name}}</span>
          </div>

          <fish-input v-model="input"></fish-input>

          <fish-button @click="send">
            <i class="fas fa-paper-plane"></i>
          </fish-button>
        </div>
      </fish-card>
    </div>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  components: {
    VueJsonPretty,
  },
  data() {
    return {
      db: undefined,
      isVisible: false,
      input: '',
      items: [],
    };
  },
  created() {
    this.$eventBus.$on('openREPLView', this.openView);
    this.$eventBus.$on('closeModals', this.closeView);
  },
  mounted() {
    window.addEventListener('keydown', this.onKeyDown);

    this.onItem();
  },
  beforeDestroy() {
    this.$eventBus.$off('openREPLView', this.openView);
    this.$eventBus.$off('closeModals', this.closeView);

    window.removeEventListener('keydown', this.onKeyDown);
  },
  methods: {
    openView({ db }) {
      this.db = db;
      this.isVisible = true;
    },
    closeView() {
      this.db = undefined;
      this.items = [];
      this.isVisible = false;
    },
    onKeyDown(e) {
      if (e.keyCode === 13) {
        this.send();
      }
    },
    onItem() {
      setTimeout(() => {
        this.$refs.replItems.scrollTop = this.$refs.replItems.scrollHeight;
      }, 20);
    },
    send() {
      if (this.input) {
        if (this.input.startsWith('SELECT ')) {
          this.$message.error('Cant run SELECT on REPL');
          this.input = '';
        } else {
          this.items.push({ type: 'i', data: this.input });

          this.onItem();

          this.$network.sendCommand({ db: this.db.id, command: this.input })
            .then((response) => {
              this.items.push({ type: 'o', data: response.result });
              this.onItem();
            })
            .catch(() => {
              this.$message.error('Command error!');
            });

          this.input = '';
        }
      }
    },
  },
};
</script>

<style lang="scss">
  .repl-bg-overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    z-index: 100;

    background: rgba(0, 0, 0, 0.3);

    display: none;

    cursor: pointer;

    &.visible {
      display: block;
    }
  }

  .repl {
    border: 1px solid #aaa;

    height: 600px;

    position: fixed;
    bottom: 10px;
    left: 10px;
    right: 10px;

    transform: translateY(150%);

    z-index: 101;

    transition: all 400ms ease-in-out;

    font-size: 1.1rem;

    &.visible {
      transform: translateY(0%);
    }

    .fish.card {
      height: 100%;

      .content {
        position: relative;
        height: 100%;


        .repl-close-button {
          display: inline-block;
          cursor: pointer;

          position: absolute;

          right: 10px;
          top: 10px;
        }

        .repl-items {
          position: absolute;
          top: 20px;
          left: 30px;
          right: 40px;
          bottom: 70px;

          overflow-y: scroll;

          .repl-item {
            padding: 4px 0px;
          }
        }

        .bottom {
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 10px;

          display: flex;

          &>* {
              margin: 5px;
          }

          .fish.input {
            flex: 1;
          }

          .info {
            display: flex;
            justify-content: center;
            align-items: center;

            color: #444;
          }
        }
      }
    }
  }
</style>
