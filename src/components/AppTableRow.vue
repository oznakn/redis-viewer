<template>
  <div class="container">
    <fish-button size="tiny">
      <i class="fa fa-pen"></i>
    </fish-button>

    <fish-button type="negative" size="tiny">
      <i class="fa fa-times"></i>
    </fish-button>
  </div>
</template>

<script>
export default {
  props: ['record'],
};
</script>

<style lang="scss" scoped>
  .container {
    text-align: right;

    &>* {
      margin-left: 5px;
      margin-right: 5px;
    }
  }
</style>
