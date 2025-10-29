<template>
  <div class="app">
    {{ count }}
    <button @click="addCount">+1</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
const count = ref(10);
function addCount() {
  count.value++;
}
</script>
