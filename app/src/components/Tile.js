import kind from '@enact/core/kind';
import Spottable from '@enact/spotlight/Spottable';
import PropTypes from 'prop-types';
import {launchApp} from '../services/webosBridge';
import css from './Tile.module.less';

/**
 * A focusable tile. Pressing OK/Enter on a focused tile fires onClick
 * (Enact's Spottable synthesises a click from the OK key), which asks the
 * applicationManager LS2 service to launch the target app by ID.
 *
 * Note: Spottable sets tabIndex itself. We do NOT set tabIndex here — a
 * manual value interferes with the spatial-nav focus manager.
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
		<div {...rest} data-variant={variant}>
			<div className={css.inner}>
				<div className={css.label}>{label}</div>
			</div>
		</div>
	)
});

// Spottable adds spatial-nav focus; it manages its own tabIndex + the
// .spottable / .spottable-focused classes our stylesheet hooks.
const Tile = Spottable(TileBase);

export default Tile;
