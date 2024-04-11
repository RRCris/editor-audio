import css from "./style.module.css";
import { Iconify } from "../Iconify/Iconify";
import PropTypes from "prop-types";

export function InputText({ name = "unnamed", value, onChange }) {
	// const [value, onChange] = useState("");

	return (
		<label className={css.container}>
			<Iconify icon="fluent:rename-24-regular" size={35} color={value?.length ? "#5E00A0" : "#B5B5B5"} />

			<div className={css.container__input}>
				<input
					type="text"
					value={value}
					onChange={e => onChange && onChange(e.target.value)}
					onKeyDown={e => e.stopPropagation()}
				/>
				<p className={value?.length ? css.hasText : css.unContent}>{name}</p>
			</div>
		</label>
	);
}
InputText.propTypes = {
	name: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func,
};
