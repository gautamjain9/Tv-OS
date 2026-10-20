import {useEffect, useState} from 'react';
import Spotlight from '@enact/spotlight';
import AppsRow from '../components/AppsRow';
import InputsRow from '../components/InputsRow';
import TopBar from '../components/TopBar';
import css from './HomePanel.module.less';

const APPS = [
	{id: 'youtube.leanback.v4', label: 'YouTube'},
	{id: 'netflix', label: 'Netflix'},
	{id: 'amazon', label: 'Prime Video'},
	{id: 'com.disney.disneyplus-prod', label: 'Disney+'},
	{id: 'com.webos.app.livetv', label: 'Live TV'}
];

const INPUTS = [
	{id: 'com.webos.app.hdmi1', label: 'HDMI 1'},
	{id: 'com.webos.app.hdmi2', label: 'HDMI 2'},
	{id: 'com.webos.app.hdmi3', label: 'HDMI 3'}
];

/**
 * HomePanel is the single screen. We set initial Spotlight focus on mount
 * and surface a visible debug line (bottom-left) so we can SEE on the TV
 * whether Spotlight thinks the DOM has focusable tiles yet. This debug
 * line gets removed once focus is proven working.
 */
const HomePanel = () => {
	const [debug, setDebug] = useState('mounted');

	useEffect(() => {
		const t = setTimeout(() => {
			const spottables = document.querySelectorAll('.spottable');
			const info = `spottable count: ${spottables.length}  ·  focused: ${Spotlight.getCurrent()?.className || 'none'}`;
			setDebug(info);
			if (spottables.length > 0) {
				Spotlight.focus(spottables[0]);
				setTimeout(() => {
					setDebug(info + `  ·  after-focus: ${Spotlight.getCurrent()?.className || 'none'}`);
				}, 100);
			}
		}, 250);
		return () => clearTimeout(t);
	}, []);

	return (
		<div className={css.homePanel}>
			<TopBar />
			<AppsRow items={APPS} />
			<InputsRow items={INPUTS} />
			<div className={css.debug}>{debug}</div>
		</div>
	);
};

export default HomePanel;
