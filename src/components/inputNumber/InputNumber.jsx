import PropTypes from "prop-types";
import css from "./style.module.css";
import { useEffect, useState } from "react";
import { verifidValid } from "../../utilities";

export function InputNumber({ name, value, onChange, min, max, defaultValue = 0 }) {
	const [valueText, setValueText] = useState(value);
	const [errorText, setErrorText] = useState(false);
	const [messageText, setMessageText] = useState("");
	useEffect(() => {
		setValueText(value);
	}, [value]);
	const handleChange = e => {
		const { menssage, success } = verifidValid(min, max, e.target.value);
		setMessageText(menssage);
		setErrorText(!success);
		setValueText(e.target.value);
		onChange(success ? parseFloat(e.target.value) : defaultValue);
	};
	return (
		<div className={css.container}>
			{errorText && <p className={css.message}>{messageText}</p>}
			<label className={css.container_input} name={name}>
				<p>{name}</p>
				<span />
				<input
					type="text"
					name={name}
					value={valueText}
					onChange={handleChange}
					onKeyDown={e => e.stopPropagation()}
					autoComplete="off"
					style={{ border: errorText ? "1px solid red" : undefined }}
				/>
			</label>
		</div>
	);
}
InputNumber.propTypes = {
	name: PropTypes.string,
	value: PropTypes.number,
	onChange: PropTypes.func,
	min: PropTypes.number,
	max: PropTypes.number,
	defaultValue: PropTypes.number,
};
