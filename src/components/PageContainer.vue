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
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  height: calc(100vh - 70px);
  background: var(--ubox-page-bg);
}

footer {
  height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 10px;
}
</style>