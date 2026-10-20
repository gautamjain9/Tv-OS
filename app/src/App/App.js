import kind from '@enact/core/kind';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';
import PropTypes from 'prop-types';
import HomePanel from '../views/HomePanel';
import css from './App.module.less';

/**
 * App is the Spotlight / Sandstone root. We deliberately DO NOT use
 * sandstone/Panels or Panel for v0.1 — our launcher is a single view,
 * and Panels adds its own navigation chrome (incl. a close X button
 * that steals initial focus from our tiles). Single-view layout keeps
 * focus behavior simple and the chrome off-screen.
 */
const App = kind({
	name: 'App',

	propTypes: {
		className: PropTypes.string
	},

	styles: {
		css,
		className: 'app'
	},

	render: (props) => <HomePanel {...props} />
});

export default ThemeDecorator(App);
