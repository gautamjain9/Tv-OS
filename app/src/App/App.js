import kind from '@enact/core/kind';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';
import PropTypes from 'prop-types';
import HomePanel from '../views/HomePanel';
import css from './App.module.less';

/**
 * App is the Spotlight / Sandstone root. Sandstone's ThemeDecorator
 * already applies SpotlightRootDecorator (config `spotlight: true` is the
 * default), so we must NOT wrap it again — a second root decorator
 * registers duplicate document key/focus listeners.
 *
 * We deliberately skip sandstone/Panels for v0.1 — one view, no stack.
 */
const AppBase = kind({
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

export default ThemeDecorator(AppBase);
