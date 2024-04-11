import { Iconify } from "../Iconify/Iconify";
import css from "./style.module.css";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useContextEditor } from "../../provider/ProviderEditor";

// ----------Audios🎧
import ambientPiano from "../../assets/ambient-piano.mp3";
import elementsImpactor from "../../assets/elements-impactor.mp3";
import epicHybrid from "../../assets/epic-hybrid.mp3";
import gospelChoir from "../../assets/gospel-choir.mp3";

// --------Components🧩
import TabGroup from "../TabGroup/TabGroup";
import Tab from "../TabGroup/Tab";
import ErrorTab from "../TabGroup/ErrorTab";
import CardAudio from "../CardAudio/CardAudio";
import ModalBasic from "../Modals/ModalBasic";
import ButtonOption from "../ButtonOption/ButtonOption";
import MusicPlayer from "../MusicPlayer/MusicPlayer";
import { InputSlide } from "../InputSlide/InputSlide";
import HeaderMenu from "../HeaderMenu/HeaderMenu";
import ButtonOptionToggle from "../ButtonOptionToggle/ButtonOptionToggle";
// ----------

const library = [
	{ audio: ambientPiano, title: "Ambient Piano" },
	{ audio: elementsImpactor, title: "Elements Impactor" },
	{ audio: epicHybrid, title: "epic hybrid" },
	{ audio: gospelChoir, title: "gospel choir" },
];

export default function Header() {
	const { historyModal, zoom, setZoom, control, loop, setLoop } = useContextEditor();
	const [myModal, setMyModal] = useState(null);
	const [playing, setPlaying] = useState(control.state === "playing");
	const [audios, setAudios] = useState(control.audios);

	// CAMBIO DE HISTORIAL
	useEffect(() => {
		const sub = historyModal.change$.subscribe(last => {
			if (last?.id === "root") {
				setMyModal(last);
			} else {
				setMyModal(null);
			}
		});

		// desmount
		return () => sub.unsubscribe();
	}, []);

	// CAMBIO DE ESTADO PARA EL BOTON DE PLAY/PAUSE
	useEffect(() => {
		const subs$ = [];
		subs$.push(
			control.addListenerEvent("CHANGE_STATE", () => {
				setPlaying(control.state === "playing");
			})
		);
		subs$.push(control.addListenerEvent("CHANGE_AUDIOS", setAudios));

		return () => subs$.forEach(sub => sub.unsubscribe());
	}, []);

	const handlePlay = () => {
		if (playing) control.pause();
		else control.play();
	};

	return (
		<div className={css.container}>
			{/* Modales */}
			{myModal?.name === "library" && (
				<ModalBasic blur position="bottom" type="options">
					<div>
						<TabGroup
							dataBase={[
								{ icon: "ph:books-duotone", name: "tab_1", title: "Library" },
								{ icon: "gravity-ui:files", name: "tab_2", title: "Local" },
							]}
						>
							<Tab name="tab_1">
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexWrap: "wrap",
										gap: "10px",
										padding: "10px 0",
									}}
								>
									{library.map((aud, key) => (
										<CardAudio audio={aud.audio} title={aud.title} key={key} />
									))}
								</div>
							</Tab>
							<Tab name="tab_2">
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexWrap: "wrap",
										gap: "10px",
										padding: "10px 0",
									}}
								>
									{audios.map((aud, key) => (
										<CardAudio audio={gospelChoir} title={"audio " + key} key={key} />
									))}
									<CardAudio newAudio onNewAudio={console.log} />
								</div>
							</Tab>
							<ErrorTab>
								<p>have error</p>
							</ErrorTab>
						</TabGroup>
					</div>
				</ModalBasic>
			)}
			{myModal?.name === "zoom" && (
				<ModalBasic position="bottom" type="inputs">
					<InputSlide
						name="Zoom"
						min={0.1}
						max={10}
						defaultNumber={1}
						value={zoom / 1000}
						onChange={zoom => setZoom(zoom * 1000)}
					/>
				</ModalBasic>
			)}
			{myModal?.name === "config" && (
				<ModalBasic blur position="bottom" type="options">
					<HeaderMenu>Configuración</HeaderMenu>
					<ButtonOptionToggle
						icon="ph:infinity-bold"
						name="Repetir"
						toggleValue={loop}
						onMouseUp={() => setLoop(!loop)}
					/>
					<ButtonOption
						icon="uil:file-export"
						name="Exportar"
						onClick={() => historyModal.addNewModal({ id: "root", name: "export" })}
					/>
					<ButtonOption
						icon="mage:sound-waves"
						name="Añadir Sonido"
						onClick={() => historyModal.addNewModal({ id: "root", name: "library" })}
					/>
					<ButtonOption icon="fluent:arrow-fit-24-filled" name="Duración" />
				</ModalBasic>
			)}
			{myModal?.name === "export" && (
				<ModalBasic blur position="center" type="float">
					<MusicPlayer />
				</ModalBasic>
			)}
			<button className={css.container_button} onClick={handlePlay}>
				<Iconify icon={playing ? "ph:pause-fill" : "ph:play-fill"} size={30} />
			</button>
			<button
				className={css.container_button}
				onClick={() => {
					control.timeCurrent = 0;
					control.pause();
				}}
			>
				<Iconify icon="mdi:reload" size={30} />
			</button>
			<button
				className={css.container_button}
				onClick={() => historyModal.addNewModal({ id: "root", name: "library" })}
			>
				<Iconify icon="ph:books-duotone" size={30} />
			</button>
			<button className={css.container_button} onClick={() => historyModal.addNewModal({ id: "root", name: "zoom" })}>
				<Iconify icon="basil:zoom-in-solid" size={30} />
			</button>
			<button className={css.container_button}>
				<Iconify
					icon="icon-park-solid:setting-one"
					size={30}
					onClick={() => historyModal.addNewModal({ id: "root", name: "config" })}
				/>
			</button>
		</div>
	);
}

Header.propTypes = {
	addModal: PropTypes.func,
};
