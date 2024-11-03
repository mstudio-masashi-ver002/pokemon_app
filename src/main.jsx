import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/style.scss'

createRoot(document.getElementById('root')).render(
    <div className="sp_only">
        <App />
    </div>
)
