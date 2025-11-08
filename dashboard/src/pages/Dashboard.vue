<script setup>
    import PocketBase from 'pocketbase';
    import Issue from '../components/Issue.vue'
    const pb = new PocketBase('http://127.0.0.1:8090');
    await pb.collection("_superusers").authWithPassword('ruizramos04@gmail.com','awesome123');
    const results = await pb.collection('reports').getFullList();
    console.log(results);
    
    const response = JSON.stringify(results);

</script>

<template>
      <div v-for="result in results.items" :key="result.id">{{result.collectionName}}</div>
      <Issue
            v-for="record in results"
            :key="record.id"
            :email="record.email" 
            :pageUrl="record.pageUrl"
            :category="record.category"
            :severity="record.severity"
            />
</template>
