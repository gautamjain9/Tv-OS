import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import Tile from './Tile';
import css from './AppsRow.module.less';

const AppsRow = kind({
	name: 'AppsRow',
	propTypes: {
		items: PropTypes.arrayOf(
			PropTypes.shape({id: PropTypes.string, label: PropTypes.string})
		).isRequired
	},
	styles: {css, className: 'appsRow'},
	render: ({items, ...rest}) => (
		<section {...rest}>
			<h2 className={css.sectionTitle}>Apps</h2>
			<div className={css.scroller}>
				{items.map((app) => (
					<Tile key={app.id} appId={app.id} label={app.label} />
				))}
			</div>
		</section>
	)
});

export default AppsRow;
