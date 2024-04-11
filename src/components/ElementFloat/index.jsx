import css from "./style.module.css";
import PropTypes from "prop-types";
import { memo, useCallback, useEffect, useRef } from "react";
import { getClientPosition, limitPosition } from "../../utilities/components";

/*
el objetivo es:
1 que reciba un valor{x,y} y un elemento ROOT? - con esto se posiciona  en elemento ROOT? con la poscion indicada
2 va recibir un elemento el cual va a contener
3 va a estar atento si se arrastra
4 al momento de arrastrar añade los eventos de seguimiento y finalizacion al ROOT?
5 va obtener en tiempo real los nuevas cordenadas y va mostrar una previsualización de donde quedaria
6 a medida que muestra la previsualizacion va ejecutando el metodo preview dado por parametros
7 cuando se halla soltado el elemento recoge las nuevas cordenadas y las envia por change
*/
let dragPosition = { x: 0, y: 0 };
let sendDragPosition = { x: 0, y: 0 };
let startPosition = { x: 0, y: 0 };
let clock = null;
const PXAREADRAGGIN = 5;
function ElementF({ ROOT, children, value, onChange, onPreview, unMargin, unLimit, unPostion, zIndex, ...props }) {
	const refContent = useRef(null);

	// Callback Accions
	const prevent = useCallback(e => e.preventDefault(), []);
	const handleStart = e => {
		if (ROOT?.current && refContent.current) {
			// utlizamos el cache para guardar el dato sin que se re-renderize el componente
			const pos = getClientPosition(e);
			startPosition = pos;
			dragPosition = pos;
			sendDragPosition = pos;
			// limpiamos y iniciamos nuestro palpito
			if (clock) clearInterval(clock);
			clock = setInterval(() => {
				if (sendDragPosition !== dragPosition) {
					sendDragPosition = dragPosition;
					onPreview && onPreview(dragPosition);
				}
			}, 33);

			// añadimos al body los eventos correspondientes para seguir el drag y terminarlo -> al body para poder segurlos por toda la pagina
			document.body.addEventListener("mousemove", handleDragging);
			document.body.addEventListener("mouseup", HandleDrop);
			document.body.addEventListener("touchmove", handleDragging);
			document.body.addEventListener("touchend", HandleDrop);

			document.body.addEventListener("dragstart", prevent);
			// necesito impedir que el scroll se mueva cuando arrastro algun objeto
			document.getElementsByTagName("main")[0].style.overflow = "hidden";
		}
	};
	const handleDragging = e => {
		if (ROOT?.current && refContent.current) {
			// calcula la poscion
			const dragPos = getClientPosition(e);
			const diferencePosition = { x: dragPos.x - startPosition.x, y: dragPos.y - startPosition.y };
			const newPosition = { x: value.x + diferencePosition.x, y: value.y + diferencePosition.y };
			// por si no quiero que se salga del cuadro
			const margin = {
				x: unMargin ? 0 : refContent.current.offsetWidth,
				y: unMargin ? 0 : refContent.current.offsetHeight,
			};
			const limits = { x: ROOT?.current.offsetWidth, y: ROOT?.current.offsetHeight };
			// acerco las cordenadas al numero miltiplo de 3 más cercano -> esto impide que se renderice por cualquier cambio de pixel
			const position = unLimit ? newPosition : limitPosition(limits, newPosition, margin);
			const posPerformance = {
				x: Math.floor(position.x / PXAREADRAGGIN) * PXAREADRAGGIN,
				y: Math.floor(position.y / PXAREADRAGGIN) * PXAREADRAGGIN,
			};
			dragPosition = posPerformance;
		}
	};
	const HandleDrop = e => {
		// nuestro palpito
		if (clock) clearInterval(clock);

		if (ROOT?.current && refContent.current) {
			// calculamos el punto donde se solto
			const dropPos = getClientPosition(e);
			const diferencePosition = { x: dropPos.x - startPosition.x, y: dropPos.y - startPosition.y };
			const newPosition = { x: value.x + diferencePosition.x, y: value.y + diferencePosition.y };
			const margin = {
				x: unMargin ? 0 : refContent.current.offsetWidth,
				y: unMargin ? 0 : refContent.current.offsetHeight,
			};
			const limits = { x: ROOT?.current.offsetWidth, y: ROOT?.current.offsetHeight };
			const position = unLimit ? newPosition : limitPosition(limits, newPosition, margin);

			onChange && onChange({ x: Math.floor(position.x), y: Math.floor(position.y) });
			// eliminamos los elementos añadidos cuando se inicio el drag
			document.body.removeEventListener("mousemove", handleDragging);
			document.body.removeEventListener("mouseup", HandleDrop);
			document.body.removeEventListener("touchmove", handleDragging);
			document.body.removeEventListener("touchend", HandleDrop);
			// devolvemos la capacidad de hacer scroll
			document.getElementsByTagName("main")[0].style.overflow = "auto";
		}
	};
	// actualiza el cache al momento de montarse nada más
	useEffect(() => {
		startPosition = value;
	}, []);

	console.log("%cRender FLoat", "color:#9c9");
	return (
		<div
			className={!unPostion && css.container}
			style={{
				top: value?.y,
				left: value?.x,
				zIndex,
			}}
			onTouchStart={handleStart}
			onMouseDown={handleStart}
			ref={refContent}
			{...props}
		>
			{children}
		</div>
	);
}
export const ElementFloat = memo(ElementF);
ElementF.propTypes = {
	ROOT: PropTypes.object,
	children: PropTypes.node,
	value: PropTypes.object.isRequired,
	onChange: PropTypes.func,
	onPreview: PropTypes.func,
	unMargin: PropTypes.bool,
	unLimit: PropTypes.bool,
	unPostion: PropTypes.bool,
	zIndex: PropTypes.number,
};
