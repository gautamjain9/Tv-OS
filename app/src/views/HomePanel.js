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
 * HomePanel is the single screen. We force initial focus by calling the
 * DOM element's own .focus() instead of Spotlight.focus(elem) — real DOM
 * focus events are what Spottable listens for to add .spottable-focused.
 *
 * The debug line below surfaces Spotlight state and the ACTUAL className
 * on the focused DOM element, so we can see from a photo what's happening
 * in the WebView.
 */
const HomePanel = () => {
	const [debug, setDebug] = useState('mount');

	useEffect(() => {
		const t = setTimeout(() => {
			const spottables = document.querySelectorAll('.spottable');
			if (spottables.length === 0) {
				setDebug('no spottable elements in DOM');
				return;
			}
			// Call .focus() on the real DOM node — triggers a native focus
			// event. Spottable's onFocus handler listens for this and adds
			// the .spottable-focused class. Calling Spotlight.focus(elem)
			// alone updates Spotlight's internal state but may not fire a
			// DOM focus event in Enact 4.0.9.
			spottables[0].focus();
			// Tell Spotlight too, so arrow-key spatial-nav is consistent.
			Spotlight.focus(spottables[0]);

			setTimeout(() => {
				const current = document.activeElement;
				const cls = current ? current.className : 'no activeElement';
				const count = document.querySelectorAll('.spottable').length;
				const focusedCount = document.querySelectorAll('.spottable-focused').length;
				setDebug(`count=${count} focused=${focusedCount} active=${cls.slice(0, 80)}`);
			}, 150);
		}, 300);
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
