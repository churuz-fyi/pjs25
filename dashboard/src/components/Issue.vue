<script setup>
    const props = defineProps({
        email: String,
        URL: String,
        issue: String,
        severity: String

    })
</script>


<template>
        <p>Email: {{props.email}}</p>
        <p>URL: <a :href="props.url">{{ props.URL }}</a></p>
        <p>Issue: {{props.issue}}</p>
        <p>Severity: {{props.severity}}</p>
</template>