import "./styles/main.scss"
import App from './App';

const app = new App();
app.Init().catch(() => {
    console.log('Failed to initialize app');
});