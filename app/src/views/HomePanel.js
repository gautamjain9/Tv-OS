import kind from '@enact/core/kind';
import {Header, Panel} from '@enact/sandstone/Panels';
import PropTypes from 'prop-types';
import AppsRow from '../components/AppsRow';
import InputsRow from '../components/InputsRow';
import TopBar from '../components/TopBar';
import css from './HomePanel.module.less';

// Pre-registered apps. On a non-root webOS, we cannot discover installed apps,
// so the user curates this list. app IDs confirmed on genuine LG webOS; Digie Hub
// IDs will be verified on-device.
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

const HomePanel = kind({
	name: 'HomePanel',

	propTypes: {
		title: PropTypes.string
	},

	defaultProps: {
		title: 'Tv-OS'
	},

	styles: {
		css,
		className: 'homePanel'
	},

	render: ({title, ...rest}) => (
		<Panel {...rest}>
			<Header title={title} />
			<TopBar />
			<AppsRow items={APPS} />
			<InputsRow items={INPUTS} />
		</Panel>
	)
});

export default HomePanel;
