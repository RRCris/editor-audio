import { Iconify } from "../Iconify/Iconify";
import PropTypes from "prop-types";
import css from "./style.module.css";

export function ButtonBack({ onBack, optional }) {
	return (
		<label className={optional ? css.container_optional : css.container__standard} onClick={onBack}>
			<Iconify icon="icon-park-twotone:back" size={35} />
			<span>Atras</span>
		</label>
	);
}
ButtonBack.propTypes = {
	onBack: PropTypes.func,
	optional: PropTypes.bool,
};
