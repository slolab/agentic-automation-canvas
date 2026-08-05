import { createApp } from 'vue'
import './styles/main.css'
import App from './App.vue'

const normalizedPath = window.location.pathname.replace(/\/+$/, '')

if (normalizedPath.endsWith('/v2')) {
  document.title = 'Agentic Automation Canvas v2'
  import('./v2/V2App.vue').then(({ default: V2App }) => {
    createApp(V2App).mount('#app')
  })
} else {
  createApp(App).mount('#app')
}
