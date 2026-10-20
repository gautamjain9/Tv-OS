import kind from '@enact/core/kind';
import Spottable from '@enact/spotlight/Spottable';
import PropTypes from 'prop-types';
import {launchApp} from '../services/webosBridge';
import css from './Tile.module.less';

/**
 * A focusable tile. Clicking (or pressing OK on a focused tile) asks the
 * applicationManager LS2 service to launch the target app by ID.
 */
const TileBase = kind({
	name: 'Tile',

	propTypes: {
		appId: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		variant: PropTypes.oneOf(['app', 'input'])
	},

	defaultProps: {
		variant: 'app'
	},

	styles: {css, className: 'tile'},

	handlers: {
		onClick: (ev, {appId}) => {
			launchApp(appId);
		}
	},

	render: ({label, variant, ...rest}) => (
		<div {...rest} data-variant={variant} tabIndex={-1}>
			<div className={css.inner}>
				<div className={css.label}>{label}</div>
			</div>
		</div>
	)
});

// Spottable makes the element focusable in Enact's spatial-nav system.
const Tile = Spottable(TileBase);

export default Tile;
