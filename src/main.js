import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Import Pinia
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia(); // Create Pinia instance

app.use(pinia); // Register Pinia
app.mount('#app');
