import kind from '@enact/core/kind';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';
import SpotlightRootDecorator from '@enact/spotlight/SpotlightRootDecorator';
import PropTypes from 'prop-types';
import HomePanel from '../views/HomePanel';
import css from './App.module.less';

/**
 * App is the Spotlight / Sandstone root. ThemeDecorator in Sandstone
 * 2.0.5 does NOT always include SpotlightRootDecorator — we wrap it
 * explicitly so Spotlight's global key listeners attach and 5-way
 * navigation actually reaches our tiles.
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

// Order matters: SpotlightRootDecorator must wrap AppBase, then ThemeDecorator.
export default ThemeDecorator(SpotlightRootDecorator(AppBase));
