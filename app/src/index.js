import {createRoot} from 'react-dom/client';
import App from './App/App';

const appElement = (<App />);

// Enact wires window.webOS when loaded on-TV; nothing to do here.
if (typeof window !== 'undefined') {
	const root = createRoot(document.getElementById('root'));
	root.render(appElement);
}

export default appElement;
