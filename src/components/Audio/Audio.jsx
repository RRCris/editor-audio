import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import wave from "wavesurfer.js";

import css from "./style.module.css";
import { pxPerSegment } from "../../models/values";
import ModalBasic from "../Modals/ModalBasic";

import { Iconify } from "../Iconify/Iconify";
import { useContextEditor } from "../../provider/ProviderEditor";
import { InputSlide } from "../InputSlide/InputSlide";
import ButtonOption from "../ButtonOption/ButtonOption";
import HeaderMenu from "../HeaderMenu/HeaderMenu";
import Draggable from "../Draggeble/Draggable";

export default function Audio({ duration, control, ScrollObserver }) {
	const { historyModal, zoom, control: compositionControl } = useContextEditor();

	const [durationBuffer, setDurationBuffer] = useState(control.durationBuffer);
	const [state, setState] = useState(control.state);

	const [cropStart, setCropStart] = useState(control.cropStart);
	const [cropEnd, setCropEnd] = useState(control.cropEnd);
	const [delay, setDelay] = useState(control.delay);
	const [volumen, setVolumen] = useState(control.volumen);
	const [myModal, setMyModal] = useState(null);
	const [waveSurfer, setWavesurfer] = useState(null);

	const refButton = useRef(null);

	const ref = useRef(null);

	// carga y destruye grafico
	useEffect(() => {
		const w = wave.create({
			container: ref.current,
			waveColor: control.colors.text,
			url: control.getLink(),
			width: (control.durationBuffer / zoom) * pxPerSegment,
			height: 60,
			cursorColor: "#0000",
		});
		setWavesurfer(w);
		return () => {
			w.destroy();
		};
	}, []);

	// configurar grafico
	useEffect(() => {
		if (waveSurfer) {
			// listerners
			const subs$ = [];
			subs$.push(
				control.addListenerEvent("PLAYING", current => {
					current = compositionControl.timeCurrent - control.delay;
					waveSurfer.seekTo((current + control.cropStart) / control.durationBuffer);
				})
			);
			subs$.push(
				control.addListenerEvent("LOAD_END", () =>
					waveSurfer.setOptions({ width: (control.durationBuffer / zoom) * pxPerSegment })
				)
			);

			// clean listeners and delete graph
			return () => {
				subs$.forEach(sub => sub.unsubscribe());
			};
		}
	}, [waveSurfer]);

	// reactividad del grafico con el zoom
	useEffect(() => {
		if (waveSurfer) {
			waveSurfer.setOptions({ width: (control.durationBuffer / zoom) * pxPerSegment });
		}
	}, [zoom]);

	// añadir listeners de scrool y el control de audio
	useEffect(() => {
		const subs$ = []; // LISTA DE EVENTOS

		subs$.push(
			ScrollObserver.subscribe(posX => {
				if (refButton.current) {
					refButton.current.style.transform = `translate(${posX}px)`;
				}
			})
		);

		subs$.push(
			historyModal.change$.subscribe(last => {
				if (last?.id === control.id) {
					setMyModal(last);
				} else {
					setMyModal(null);
				}
			})
		);

		const syncValuesState = () => {
			// actualiza los estados con la info de la clase
			setDurationBuffer(control.durationBuffer);
			setCropStart(control.cropStart);
			setCropEnd(control.cropEnd);
			setDelay(control.delay);
			setState(control.state);
			// conecta los cambios de valores con el cambio de estado
			subs$.push(control.addListenerEvent("CHANGE_CROP_START", setCropStart));
			subs$.push(control.addListenerEvent("CHANGE_CROP_END", setCropEnd));
			subs$.push(control.addListenerEvent("CHANGE_DELAY", setDelay));
			subs$.push(control.addListenerEvent("CHANGE_STATE", setState));
			subs$.push(control.addListenerEvent("CHANGE_VOLUMEN", setVolumen));
		};
		control.addListenerEvent("LOAD_END", syncValuesState);
		control.addListenerEvent("ERROR_LOAD", console.log);

		//  desconecta los eventos con los estados
		return () => {
			subs$.forEach(sub => sub.unsubscribe());
		};
	}, []);

	const deleteAudio = () => {
		historyModal.filterHistory(control.id);
		const res = compositionControl.audios.filter(aud => aud.id !== control.id);
		compositionControl.audios = [...res];
	};

	const width =
		myModal?.name === "crop" ? (control.durationBuffer / zoom) * pxPerSegment : (duration / zoom) * pxPerSegment;

	return (
		<div className={css.container} style={{ background: control.colors.container, width }}>
			<div style={{ position: "relative" }}>
				{myModal?.name === "crop" && (
					<>
						<Draggable position={cropStart} onChange={nt => (control.cropStart = nt)}>
							<div className={css.bar_indicador} />
						</Draggable>
						<Draggable position={cropEnd} onChange={nt => (control.cropEnd = nt)}>
							<div className={css.bar_indicador} />
						</Draggable>
					</>
				)}
				{myModal?.name === "move" && (
					<Draggable position={delay} onChange={nt => (control.delay = nt)}>
						<div
							style={{
								width: ((cropEnd - cropStart) / zoom) * pxPerSegment,
								height: "100%",
								background: "#FFF4",
								border: "2px dashed #000",
							}}
						/>
					</Draggable>
				)}

				<div style={{ background: control.colors.text }} className={css.line_mid} />
				<div
					style={{
						transform: myModal?.name === "crop" ? undefined : `translateX(${(delay / zoom) * pxPerSegment}px)`,
						overflow: "hidden",
						width: myModal?.name === "crop" ? "fit-content" : ((cropEnd - cropStart) / zoom) * pxPerSegment,
						margin: "10px 0",
						pointerEvents: "none",
					}}
				>
					<div
						ref={ref}
						style={{
							transform: myModal?.name === "crop" ? undefined : `translateX(-${(cropStart / zoom) * pxPerSegment}px)`,
							position: "relative",
						}}
					/>
				</div>
			</div>

			<div
				className={css.option}
				ref={refButton}
				style={{ background: control.colors.backText, color: control.colors.text }}
				onClick={() => historyModal.addNewModal({ id: control.id, name: "settings" })}
			>
				<Iconify size={25} icon="icon-park-solid:setting-one" />
				<p> Abrir Configuraciones</p>
			</div>
			{!!myModal && (
				<ModalBasic position="top" type="inputs">
					{state === "stop" && <button onClick={() => control.playSelf()}>Probar</button>}
					{state === "playingSelf" && <button onClick={() => control.pause()}>Pausar</button>}
					{state === "loading" && <p>Cargando...</p>}
				</ModalBasic>
			)}
			{myModal?.name === "settings" && (
				<ModalBasic position="bottom" type="options">
					<HeaderMenu>Modificar</HeaderMenu>
					<ButtonOption icon="tabler:trash" name="Eliminar" onClick={deleteAudio} />
					<ButtonOption
						icon="mingcute:move-line"
						name="Mover"
						onClick={() => historyModal.addNewModal({ id: control.id, name: "move" })}
					/>
					<ButtonOption
						icon="ic:outline-crop"
						name="Cortar"
						onClick={() => historyModal.addNewModal({ id: control.id, name: "crop" })}
					/>
					<ButtonOption
						icon="lets-icons:sound-min"
						name="Volumen"
						onClick={() => historyModal.addNewModal({ id: control.id, name: "volumen" })}
					/>
				</ModalBasic>
			)}
			{myModal?.name === "move" && (
				<ModalBasic position="bottom" type="inputs">
					<div style={{ color: control.colors.text }}>
						<InputSlide
							name="DELAY"
							min={0}
							max={20000 / 1000}
							defaultNumber={0}
							value={delay / 1000}
							onChange={num => (control.delay = num * 1000)}
						/>
					</div>
				</ModalBasic>
			)}
			{myModal?.name === "crop" && (
				<ModalBasic position="bottom" type="inputs">
					<div
						style={{
							color: control.colors.text,
							display: "flex",
							justifyContent: "center",
							gap: 10,
							flexDirection: "column",
						}}
					>
						<InputSlide
							name="CROP START"
							min={0}
							max={durationBuffer / 1000}
							value={cropStart / 1000}
							defaultNumber={0}
							onChange={num => (control.cropStart = num * 1000)}
						/>

						<InputSlide
							name="CROP END"
							min={0}
							max={durationBuffer / 1000}
							value={cropEnd / 1000}
							defaultNumber={durationBuffer / 1000}
							onChange={numb => (control.cropEnd = numb * 1000)}
						/>
					</div>
				</ModalBasic>
			)}
			{myModal?.name === "volumen" && (
				<ModalBasic position="bottom" type="inputs">
					<div style={{ color: control.colors.text }}>
						<InputSlide name="VOLUMEN" min={0} max={100} value={volumen} onChange={vol => (control.volumen = vol)} />
					</div>
				</ModalBasic>
			)}
		</div>
	);
}
Audio.propTypes = {
	duration: PropTypes.number,
	control: PropTypes.object,
	ScrollObserver: PropTypes.object,
};
