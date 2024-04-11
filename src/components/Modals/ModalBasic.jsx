import css from "./style.module.css";
import PropTypes from "prop-types";
import { ButtonBack } from "../ButtonBack/ButtonBack";
import ModalMenu from "../ModalMenu/ModalMenu";
import { useWidth } from "../../hooks";

import { useContextEditor } from "../../provider/ProviderEditor";

const types = {
	inputs: "inputs",
	options: "options",
	float: "float",
};
const classTypes = {
	inputs: css.container_inputs,
	options: css.container_options,
	float: css.container_float,
};

export default function ModalBasic({ children, type = types.float, blur, position = "center", ...props }) {
	const { watch } = useWidth("xl");
	const { historyModal } = useContextEditor()
	const onBack = () => historyModal.backModal()
	return (
		<ModalMenu backDrop={blur} position={position} idRoot="modalPc">
			<div
				className={!watch ? classTypes[type] : css.animationPC}
				style={{ animation: ".3s INmodal_small cubic- bezier(.16, 1.33, .4, 1.12)" }}
			>
				{watch && <ButtonBack onBack={onBack} optional={type === types.float} />}
				<div className={css.content} {...props}>
					{children}
				</div>
				{!watch && <ButtonBack onBack={onBack} optional={type === types.float} />}
			</div>
		</ModalMenu>
	);
}
ModalBasic.propTypes = {
	children: PropTypes.node,
	type: PropTypes.string,
	blur: PropTypes.bool,
	position: PropTypes.string,
};
