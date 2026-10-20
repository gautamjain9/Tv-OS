import kind from '@enact/core/kind';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';
import Panels from '@enact/sandstone/Panels';
import PropTypes from 'prop-types';
import HomePanel from '../views/HomePanel';
import css from './App.module.less';

const App = kind({
	name: 'App',

	propTypes: {
		className: PropTypes.string
	},

	styles: {
		css,
		className: 'app'
	},

	render: (props) => (
		<Panels {...props}>
			<HomePanel />
		</Panels>
	)
});

export default ThemeDecorator(App);
