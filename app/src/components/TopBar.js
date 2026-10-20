import {useEffect, useState} from 'react';
import css from './TopBar.module.less';

/**
 * TopBar is intentionally a plain function component (not Enact's `kind`),
 * because it holds state through React hooks. `kind` targets stateless
 * components; mixing hooks inside its `render` is unsupported in Enact 4.x
 * and silently breaks hook identity across re-renders on some targets.
 *
 * The clock updates every 15 s — we deliberately avoid per-second re-renders
 * on this low-RAM Hub box.
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

const TopBar = (props) => {
	const now = useClock();
	return (
		<div {...props} className={css.topBar}>
			<span className={css.time}>{format(now)}</span>
		</div>
	);
};

export default TopBar;
