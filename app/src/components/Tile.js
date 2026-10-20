import {forwardRef} from 'react';
import Spottable from '@enact/spotlight/Spottable';
import PropTypes from 'prop-types';
import {launchApp} from '../services/webosBridge';
import css from './Tile.module.less';

/**
 * TileBase is a plain forwardRef component — NOT Enact's `kind()` — so
 * Spottable's HOC can compose className + event handlers + ref without
 * fighting with kind's internal styles handling.
 *
 * Spottable injects:
 *   className: '<ours> spottable [spottable-focused when focused]'
 *   onKeyDown/Up, onFocus/Blur, tabIndex=0
 *   ref forwarded to the DOM element
 *
 * We MUST forward className composed and spread the rest.
 */
// eslint-disable-next-line react/display-name
const TileBase = forwardRef(({appId, label, variant = 'app', className, ...rest}, ref) => {
	const handleClick = () => launchApp(appId);
	// Spottable also sends keyboard events; onClick is enough because
	// Spottable synthesises a click from OK/Enter via emulateMouse: true.
	return (
		<div
			ref={ref}
			{...rest}
			className={[css.tile, className].filter(Boolean).join(' ')}
			data-variant={variant}
			onClick={handleClick}
		>
			<div className={css.inner}>
				<div className={css.label}>{label}</div>
			</div>
		</div>
	);
});

TileBase.propTypes = {
	appId: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	variant: PropTypes.oneOf(['app', 'input']),
	className: PropTypes.string
};

// Spottable adds spatial-nav focus; it manages .spottable + .spottable-focused
// classes our stylesheet hooks, and relays OK/Enter as click.
const Tile = Spottable(TileBase);

export default Tile;
