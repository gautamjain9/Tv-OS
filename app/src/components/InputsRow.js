import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import Tile from './Tile';
import css from './InputsRow.module.less';

const InputsRow = kind({
	name: 'InputsRow',
	propTypes: {
		items: PropTypes.arrayOf(
			PropTypes.shape({id: PropTypes.string, label: PropTypes.string})
		).isRequired
	},
	styles: {css, className: 'inputsRow'},
	render: ({items, ...rest}) => (
		<section {...rest}>
			<h2 className={css.sectionTitle}>Inputs</h2>
			<div className={css.scroller}>
				{items.map((item) => (
					<Tile key={item.id} appId={item.id} label={item.label} variant="input" />
				))}
			</div>
		</section>
	)
});

export default InputsRow;
