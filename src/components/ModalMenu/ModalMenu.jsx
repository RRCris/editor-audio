import { createPortal } from "react-dom";
import css from "./style.module.css";
import PropTypes from "prop-types";
import { useWidth } from "../../hooks";
import { useEffect, useState } from "react";

export const positionsModal = {
	top: "top",
	center: "center",
	bottom: "bottom",
};

const StylePosition = {
	top: { top: 0, bottom: "unset" },
	center: { top: "50%", transform: "translateY(-50%)" },
	bottom: { top: "unset", bottom: 0 },
};
export default function ModalMenu({ backDrop, children, position = positionsModal.top, idRoot }) {
	const { watch } = useWidth("xl");
	const [ready, setReady] = useState(false);
	useEffect(() => {
		setReady(true);
	}, []);
	if (ready)
		return createPortal(
			<div>
				{backDrop && !watch && <div className={css.background} />}
				<div className={watch ? "" : css.container_standart} style={!watch ? StylePosition[position] : {}}>
					{children}
				</div>
			</div>,
			document.getElementById(watch ? idRoot : "root-modal")
		);

	return <></>;
}
ModalMenu.propTypes = {
	backDrop: PropTypes.bool,
	children: PropTypes.node,
	position: PropTypes.string,
	idRoot: PropTypes.string,
};
