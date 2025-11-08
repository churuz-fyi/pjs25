import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue';
import Issue from '../pages/Issue.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
        {
              path: '/',
              name: 'dashboard',
              component: Dashboard,
        },
        {
              path: '/issue/:id',
              name: 'issue',
              component: Issue,
              props: true,
        }
  ],
})

export default router
