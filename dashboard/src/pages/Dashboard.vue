<script setup>
    import Issue from '../components/Issue.vue'
    const data = {
      email: "email@gmail.com",
      pageUrl: "https://google.com",
      category: "bug",
      severity: "low"
    }
</script>
<template>
      <Issue
            :email=data.email 
            :pageUrl=data.pageUrl
            :category=data.category
            :severity=data.severity
            />
</template>
