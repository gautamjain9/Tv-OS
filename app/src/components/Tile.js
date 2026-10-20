import {forwardRef, useCallback} from 'react';
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
 *   className: '<ours> spottable'
 *   onKeyDown/Up, onFocus/Blur, tabIndex=-1
 *   ref forwarded to the DOM element
 *
 * Focus styling hooks the native :focus pseudo-class — Spotlight moves
 * real DOM focus. (Enact 4.x has no `.spottable-focused` class.)
 */
// eslint-disable-next-line react/display-name
const TileBase = forwardRef(({label, variant = 'app', className, ...rest}, ref) => (
	<div
		ref={ref}
		{...rest}
		className={[css.tile, className].filter(Boolean).join(' ')}
		data-variant={variant}
	>
		<div className={css.inner}>
			<div className={css.label}>{label}</div>
		</div>
	</div>
));

TileBase.propTypes = {
	label: PropTypes.string.isRequired,
	variant: PropTypes.oneOf(['app', 'input']),
	className: PropTypes.string
};

const SpottableTile = Spottable(TileBase);

/**
 * onClick MUST be passed to Spottable itself: on OK/Enter key-up Spottable
 * calls its own `onClick` prop (emulateMouse). A div gets no native click
 * from Enter, so a handler set inside TileBase only fired for pointer clicks.
 */
const Tile = ({appId, ...rest}) => {
	const handleClick = useCallback(() => {
		launchApp(appId).catch((err) => {
			// eslint-disable-next-line no-console
			console.warn(`[Tile] launch ${appId} failed`, err);
		});
	}, [appId]);

	return <SpottableTile {...rest} onClick={handleClick} />;
};

Tile.propTypes = {
	appId: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	variant: PropTypes.oneOf(['app', 'input'])
};

export default Tile;
