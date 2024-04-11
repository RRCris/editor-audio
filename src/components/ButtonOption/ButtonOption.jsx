import css from "./style.module.css";
import PropTypes from "prop-types";
import { Iconify } from "../Iconify/Iconify";
export default function ButtonOption({ onClick, name, icon, ...props }) {
	return (
		<>
			<label className={css.container} {...props} onClick={onClick}>
				<button name={"button of option " + name} hidden />
				<Iconify size={35} icon={icon} />
				<p>{name || "Name Button"}</p>
			</label>
		</>
	);
}
ButtonOption.propTypes = {
	onClick: PropTypes.func,
	name: PropTypes.string,
	icon: PropTypes.string,
};
