<script setup>
      import PocketBase from 'pocketbase';
      defineProps({
            id: String
      })
      const pb = new PocketBase('http://127.0.0.1:8090');
      const recordId = '67xbtp4mqg474e8';
      const record = await pb.collection('reports').getOne(id);
</script>
<template>
      <h1>Issue Information</h1>
      <p>{{record.description}}</p>
</template>
