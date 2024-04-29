import { createApp } from '../runtime-vapor/src'
import App from './App'

const app = createApp(App)
app.mount('#app')