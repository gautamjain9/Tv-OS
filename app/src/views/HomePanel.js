import PropTypes from 'prop-types';
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
 * HomePanel is the single screen. Initial focus comes from Sandstone's
 * ThemeDecorator (its SpotlightRootDecorator calls Spotlight.focus() on
 * mount). If the Magic Remote pointer is showing, Spotlight defers that
 * focus until the first arrow-key press — this is intended webOS behavior.
 *
 * `className` carries the ThemeDecorator root classes (sandstone-theme,
 * enact-fit, bg) plus App's own; it must land on the outermost DOM node.
 */
const HomePanel = ({className, ...rest}) => (
	<div {...rest} className={[css.homePanel, className].filter(Boolean).join(' ')}>
		<TopBar />
		<AppsRow items={APPS} />
		<InputsRow items={INPUTS} />
	</div>
);

HomePanel.propTypes = {
	className: PropTypes.string
};

export default HomePanel;
