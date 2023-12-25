<template>
  <div class="page-container">
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
function addInputFocus() {
  const focusHandler = function (event: any) {
    const type = event.target.nodeName.toLowerCase();
    if (type == 'input' || type == 'textarea') {
      event.target.scrollIntoView(false)
    }
  };
  document.body.addEventListener('focus', focusHandler, true); //Non-IE   
}

onMounted(() => {
  addInputFocus()
})



</script>

<style scoped lang="less">
.page-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

main {
  display: flex;
  flex-direction: column;
  flex: 1
}

footer {
  height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 20px 10px;
  // background: red;
}
</style>