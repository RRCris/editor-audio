import style from "./style.module.css";
import { Iconify } from "../Iconify/Iconify";
import PropTypes from "prop-types";
import { useRef, useState, useEffect } from "react";
import { getClientPosition, verifidValid } from "../../utilities/components";

const NO_OP = () => { };
/*
como evitar el constante render y cambio de estados
A). crear scalas de numeros y renderizar solo cuando cambia el multiplo de 5 
B). crear un timer que cambie el estado cada x tiempo si el valor enviado es diferente al real✅
C). crear un retraso temporal en cuando se ejecunta un evento de cambio
*/
InputSlide.propTypes = {
	min: PropTypes.number,
	max: PropTypes.number,
	value: PropTypes.number,
	defaultNumber: PropTypes.number,
	onChange: PropTypes.func,
	name: PropTypes.string,
};
export function InputSlide({ min = 0, max = 100, value = 50, onChange = NO_OP, defaultNumber = 10, name }) {
	const [dragging, setDragging] = useState(false);
	const refSlide = useRef(null);

	const [text, setText] = useState(value);
	const [textError, setTextError] = useState(false);

	const handleChange = e => {
		const { menssage, success } = verifidValid(min, max, e.target.value);
		setText(e.target.value);
		setTextError(success ? false : menssage);
		success && onChange(e.target.value);
	};
	useEffect(() => {
		handleChange({ target: { value } });
	}, [value]);

	const handleStartDrag = e => {
		setDragging(true);
		handleDrag(e);
	};
	const handleDrag = e => {
		if (refSlide.current) {
			const element = refSlide.current.getBoundingClientRect();
			const event = getClientPosition(e);
			const diference = event.x - element.x;
			let result = diference / element.width;
			if (result > 1) result = 1;
			if (result < 0) result = 0;
			let newValue = (max - min) * result + min;
			newValue = (newValue + "").slice(0, 4);
			const dif = (max - min) * 0.05;
			if (Math.abs(newValue - value) > dif) handleChange({ target: { value: newValue } });
		}
	};

	const handleDrop = e => {

		handleDrag(e);
		setDragging(false);
	};

	const number = !textError ? parseFloat(text) : defaultNumber;
	const percentage = (number - min) / (max - min);
	return (
		<div className={style.container}>
			<input
				className={`${style.quantity} ${!!textError && style.quantity__error}`}
				type="text"
				value={text}
				onChange={handleChange}
				onKeyDown={e => e.stopPropagation()}
			/>
			<div
				className={style.container__slide}
				onMouseDown={handleStartDrag}
				onTouchStart={handleStartDrag}
				onDragStart={e => e.preventDefault()}
				onMouseMove={dragging ? handleDrag : undefined}
				onTouchMove={dragging ? handleDrag : undefined}
				onMouseUp={handleDrop}
				onTouchEnd={handleDrop}
			// onMouseLeave={dragging ? handleDrop : undefined}
			>
				<p className={style.name}>{name || "unamed"}</p>
				<div className={style.slide} ref={refSlide}>
					<div className={style.slide__active} style={{ width: percentage * 200 }} />
					<div className={style.slide__dot} style={{ left: percentage * 200 }} />
				</div>
			</div>
			<div className={style.container__icon} onClick={() => onChange(defaultNumber)}>
				<Iconify icon="basil:refresh-outline" size={37} />
			</div>
			{!!textError && <div className={style.message}>{textError}</div>}
		</div>
	);
}
