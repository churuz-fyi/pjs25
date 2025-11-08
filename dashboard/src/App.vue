<script setup>
      import Issue from './pages/Issue.vue';
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <Suspense>
        <RouterView />
  </Suspense>
</template>

<style scoped></style>
