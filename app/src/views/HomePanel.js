import {useEffect} from 'react';
import Spotlight from '@enact/spotlight';
import AppsRow from '../components/AppsRow';
import InputsRow from '../components/InputsRow';
import TopBar from '../components/TopBar';
import css from './HomePanel.module.less';

// Pre-registered apps. On a non-root webOS, we cannot discover installed
// apps, so the user curates this list. App IDs verified against genuine LG
// webOS; Digie Hub IDs confirmed on-device case-by-case (silent-failure to
// launch = wrong ID, swap it).
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
 * HomePanel is the single screen of v0.1. Plain function component so we
 * can set initial Spotlight focus on mount — otherwise focus defaults to
 * the first Spottable in the DOM (any ancestor chrome) and arrow keys
 * never reach our tiles.
 *
 * The setTimeout(..., 100) gap is deliberate: Spotlight's container
 * registration runs on the first render tick; focusing before that
 * sometimes no-ops because the targets aren't registered yet.
 */
const HomePanel = () => {
	useEffect(() => {
		const t = setTimeout(() => {
			// Pass no args → Spotlight picks the first known spottable.
			Spotlight.focus();
		}, 100);
		return () => clearTimeout(t);
	}, []);

	return (
		<div className={css.homePanel}>
			<TopBar />
			<AppsRow items={APPS} />
			<InputsRow items={INPUTS} />
		</div>
	);
};

export default HomePanel;
