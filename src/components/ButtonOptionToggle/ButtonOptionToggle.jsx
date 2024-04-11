import css from "./style.module.css";
import PropTypes from "prop-types";
import { Iconify } from "../Iconify/Iconify";
export default function ButtonOptionToggle({ onClick, name, icon, toggleValue, ...props }) {
	return (
		<>
			<label className={css.container} {...props} onClick={onClick} >
				<button name={"button of option " + name} hidden />
				<Iconify size={35} icon={icon} />
				<p>{name || "Name Button"}</p>
				<div className={`${css.toggle} ${toggleValue ? css.toggle_on : css.toggle_off}`} />
			</label>
		</>
	);
}
ButtonOptionToggle.propTypes = {
	onClick: PropTypes.func,
	name: PropTypes.string,
	icon: PropTypes.string,
	toggleValue: PropTypes.bool
};
