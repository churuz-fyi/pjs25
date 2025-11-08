<script setup>
    const props = defineProps({
        email: String,
        pageUrl: String,
        category: String,
        severity: String
    })
</script>


<template>
        <p>Email: {{email}}</p>
        <p>URL: <a :href="pageUrl">{{ pageUrl }}</a></p>
        <p>Category: {{category}}</p>
        <p>Severity: {{severity}}</p>
</template>
