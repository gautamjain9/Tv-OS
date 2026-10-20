import kind from '@enact/core/kind';
import {useEffect, useState} from 'react';
import css from './TopBar.module.less';

/**
 * Shows the clock + a thin status strip. Clock updates every 15s;
 * on this low-RAM hardware we deliberately avoid per-second re-renders.
 */
const useClock = () => {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 15000);
		return () => clearInterval(id);
	}, []);
	return now;
};

const format = (d) => {
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	const day = d.toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric'});
	return `${hh}:${mm}  ·  ${day}`;
};

const TopBar = kind({
	name: 'TopBar',
	styles: {css, className: 'topBar'},
	render: (props) => {
		const now = useClock();
		return (
			<div {...props}>
				<span className={css.time}>{format(now)}</span>
			</div>
		);
	}
});

export default TopBar;
