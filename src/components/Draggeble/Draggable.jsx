import PropTypes from "prop-types";
import { getClientPosition } from "../../utilities/components";

import css from "./style.module.css";
import { useContextEditor } from "../../provider/ProviderEditor";
import { pxPerSegment } from "../../models/values";

import { useRef, useEffect } from "react";

const NO_OP = () => {};
export default function Draggable({ children, position = 0, onChange = NO_OP, onPreview = NO_OP, ...props }) {
	const { zoom } = useContextEditor();
	const refPosition = useRef({ x: 0, y: 0 });
	const refPreview = useRef(null);

	useEffect(() => {
		if (refPreview.current) refPreview.current.style.left = `${(position / zoom) * pxPerSegment}px`;
	}, [position]);
	const startDrag = e => {
		const posDrag = getClientPosition(e);

		refPosition.current = posDrag;

		document.addEventListener("mousemove", dragging);
		document.addEventListener("touchmove", dragging);
		document.addEventListener("mouseup", endDrag);
		document.addEventListener("touchend", endDrag);

		refPreview.current && (refPreview.current.style.opacity = "1");

		const container = document.getElementById("CompositionContainer");
		container && (container.style.overflow = "hidden");
	};

	const dragging = e => {
		const posDrag = getClientPosition(e);

		const diference = { x: posDrag.x - refPosition.current.x, y: posDrag.y - refPosition.current.y };
		const Nsegmentos = diference.x / pxPerSegment;
		const miliseconds = Nsegmentos * zoom;
		const newTime = position + miliseconds;

		onPreview(newTime);

		refPreview.current && (refPreview.current.style.left = `${(newTime / zoom) * pxPerSegment}px`);
	};

	const endDrag = e => {
		const posDrag = getClientPosition(e);

		document.removeEventListener("mousemove", dragging);
		document.removeEventListener("touchmove", dragging);
		document.removeEventListener("mouseup", endDrag);
		document.removeEventListener("touchend", endDrag);

		const diference = { x: posDrag.x - refPosition.current.x, y: posDrag.y - refPosition.current.y };
		const Nsegmentos = diference.x / pxPerSegment;
		const miliseconds = Nsegmentos * zoom;
		const newTime = position + miliseconds;

		onChange(newTime);

		if (refPreview.current) refPreview.current.style.opacity = "0";

		const container = document.getElementById("CompositionContainer");
		container && (container.style.overflowX = "scroll");
	};
	return (
		<>
			<div
				onMouseDown={startDrag}
				onTouchStart={startDrag}
				onDragStart={e => e.preventDefault()}
				className={css.container}
				style={{ left: `${(position / zoom) * pxPerSegment}px` }}
				{...props}
			>
				{children}
			</div>
			<div className={css.container} style={{ pointerEvents: "none", opacity: "0.2" }} ref={refPreview}>
				{children}
			</div>
		</>
	);
}

Draggable.propTypes = {
	children: PropTypes.element,
	position: PropTypes.number,
	onChange: PropTypes.func,
	onPreview: PropTypes.func,
};
