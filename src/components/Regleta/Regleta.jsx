import PropTypes from "prop-types";
import css from "./style.module.css";
import { AudioControl } from "../../utilities/controlAudioBuffer";
import { pxPerSegment } from "../../models/values";
import { useContextEditor } from "../../provider/ProviderEditor";
export default function Regleta({ duration }) {
	const { zoom } = useContextEditor();

	let countSteps = Math.ceil(duration / zoom);
	if (countSteps < 10) countSteps = 10;

	return (
		<aside className={css.container} style={{ width: countSteps * pxPerSegment }}>
			<div style={{ width: pxPerSegment / 3 }} />
			{[...Array(countSteps)].map((_, k) => (
				<>
					<MidStep key={"midStep" + k} />
					<Step key={"step" + k} num={(k + 1) * zoom} />
				</>
			))}
		</aside>
	);
}

function Step({ num }) {
	return (
		<div className={css.step}>
			<div className={css.line__large} /> <p>{AudioControl.formatTime(num, ["M", "S"])}</p>
		</div>
	);
}

function MidStep() {
	return <div className={css.line__mid} />;
}

Regleta.propTypes = {
	zoom: PropTypes.number,
	duration: PropTypes.number,
};
Step.propTypes = {
	num: PropTypes.number,
};
