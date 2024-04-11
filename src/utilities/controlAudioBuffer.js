import { colorsAudio } from "../models/colorsAudio";
import { ObserverEventAudio } from "./ObserverEvent";

// ----------------------@TYPES

const TypeStateArray = [
	"unload",
	"loading",
	"stop",
	"playingSelf",
	"playing",
	"errorLoad",
];
// eslint-disable-next-line no-unused-vars
const TypeFormatArray = ["H", "M", "S", "MS"];

// ----------------------DEFAULTS

// -----------------------CLASS
export class AudioControl {
	// internalValues
	id = crypto.randomUUID();
	#OriginalBufferAudio;
	durationBuffer;
	#option;

	// dinamycValues
	#timePlaying = 0;
	#volumen = 1;
	#delay = 0;
	#cropStart = 0;
	#cropEnd = 0;
	colors = colorsAudio[Math.round(Math.random() * 5)];

	// temporaly
	#temporalTimer;
	#temporalSource;
	#temporalGainNode; // HOt reaload de volumen
	// states
	#state = "unload";
	#duration = 0;

	// observables events
	#ObservableEvents = new ObserverEventAudio();

	constructor(op) {
		// asign method suscribe of observables

		this.#option = { ...op };
		// if (!this.#option.src) throw new Error("Falta la propiedad src puede ser una URL o un File");
		this.loadSorce(undefined);
	}

	// ----------Valid, FireEvent, Change & hotReaload
	set volumen(percent) {
		// validate and Fire Event
		if (percent < 0) percent = 0;
		if (percent > 100) percent = 100;

		this.#volumen = percent / 100;
		this.#ObservableEvents.emit("CHANGE_VOLUMEN", percent);

		if (this.#temporalGainNode) {
			this.#temporalGainNode.gain.value = this.#volumen;
		}
	}

	get volumen() {
		return 100 * this.#volumen;
	}

	// ----------Valid, FireEvent & Change
	set state(state) {
		// validate and Fire Event
		if (TypeStateArray.includes(state)) {
			this.#state = state;
			this.#ObservableEvents.emit("CHANGE_STATE", state);
		} else console.warn("asignacion del state invalida");
	}

	get state() {
		return this.#state;
	}

	// ----------Valid, FireEvent , Change
	set delay(miliseconds) {
		if (this.durationBuffer) {
			// validate and Fire Event
			if (miliseconds < 0) miliseconds = 0;

			this.#delay = miliseconds;

			this.#setDuration();
			this.#ObservableEvents.emit("CHANGE_DELAY", this.#delay);
			this.#ObservableEvents.emit("CHANGE_DURATION", this.duration);
		}
	}

	get delay() {
		return this.#delay;
	}

	// ----------Valid, FireEvent , Change & hotReload
	set timePlaying(miliseconds) {
		if (this.durationBuffer) {
			// validate and Fire Event
			if (miliseconds < 0) miliseconds = 0;

			this.#timePlaying = miliseconds;
			this.#ObservableEvents.emit("PLAYING", miliseconds);

			if (this.state === "playingSelf") {
				this.pause();
				setTimeout(() => this.playSelf(), 100);
			}
		}
	}

	get timePlaying() {
		return this.#timePlaying;
	}

	// ----------Valid, FireEvent , Change
	#setDuration() {
		this.#duration = this.delay + (this.cropEnd - this.cropStart);
		this.#ObservableEvents.emit("CHANGE_DURATION", this.#duration);
	}

	get duration() {
		return this.#duration;
	}

	// ----------Valid, FireEvent , Change
	set cropStart(miliseconds) {
		if (this.durationBuffer) {
			// validate and Fire Event
			if (miliseconds < 0) miliseconds = 0;
			if (miliseconds > this.#cropEnd) miliseconds = this.#cropEnd;

			this.#cropStart = miliseconds;
			this.#setDuration();
			this.#ObservableEvents.emit("CHANGE_CROP_START", miliseconds);
		}
	}

	get cropStart() {
		return this.#cropStart;
	}

	// ----------
	// ----------Valid, FireEvent , Change
	set cropEnd(miliseconds) {
		if (this.durationBuffer) {
			// validate and Fire Event
			if (miliseconds < this.#cropStart) miliseconds = this.#cropStart;
			if (miliseconds > this.durationBuffer) miliseconds = this.durationBuffer;

			this.#cropEnd = miliseconds;
			this.#setDuration();
			this.#ObservableEvents.emit("CHANGE_CROP_END", miliseconds);
		}
	}

	get cropEnd() {
		return this.#cropEnd;
	}
	// ----------

	loadSorce(source) {
		// Puede Cambiar de Recurso
		if (source) this.#option.src = source;
		// o procesamos el recuerso cargado
		if (typeof this.#option.src === "string") {
			this.state = "loading";
			fetch(this.#option.src)
				.then(res => res.arrayBuffer())
				.then(bufferRaw => new AudioContext().decodeAudioData(bufferRaw))
				.then(bufferAudio => {
					this.#OriginalBufferAudio = bufferAudio;
					this.durationBuffer = bufferAudio.duration * 1000;
					this.cropEnd = this.durationBuffer;
					this.#setDuration();
					this.state = "stop";
					this.#ObservableEvents.emit("LOAD_END", bufferAudio);
				})
				.catch(err => {
					console.warn(err);
					this.#ObservableEvents.emit("ERROR_LOAD", err);

					this.state = "errorLoad";
				});
		} else {
			this.state = "loading";
			const reader = new FileReader();
			reader.onload = async e => {
				if (e.target?.result instanceof ArrayBuffer) {
					const audioBuffer = await new AudioContext().decodeAudioData(
						e.target?.result
					);
					this.#OriginalBufferAudio = audioBuffer;
					this.durationBuffer = audioBuffer.duration * 1000;
					this.cropEnd = this.durationBuffer;
					this.#setDuration();
					this.#ObservableEvents.emit("LOAD_END", audioBuffer);

					this.state = "stop";
				}
			};
			reader.onerror = err => {
				console.warn(err);
				this.#ObservableEvents.emit("ERROR_LOAD", err);
				this.state === "errorLoad";
			};
			console.log(this.#option.src);

			reader.readAsArrayBuffer(this.#option.src);
		}
	}

	play(context, timeInit, independice) {
		if (
			this.state === "stop" &&
			this.#OriginalBufferAudio &&
			this.durationBuffer
		) {
			// si el audio ya paso el tiempo de reproducir
			if (timeInit > this.durationBuffer + this.#delay) return;

			this.state = independice ? "playingSelf" : "playing";
			this.#temporalSource = context.createBufferSource();
			this.#temporalSource.buffer = this.#OriginalBufferAudio;
			this.#temporalSource.addEventListener("ended", () => {
				if (this.#state === "playingSelf") this.#timePlaying = 0;

				this.#ObservableEvents.emit("PLAYING", this.#timePlaying);
				this.pause();
			});

			// si todavia no se reproduce
			if (timeInit <= this.#delay) {
				const when = independice ? 0 : (this.#delay - timeInit) / 1000;
				const offset = this.#cropStart / 1000;
				const duration = (this.cropEnd - this.#cropStart) / 1000;
				this.#temporalSource.start(when, offset, duration);
			} else {
				// si esta en plena reproduccion
				const offTime = timeInit - this.#delay;
				const when = 0;
				const offset = (this.#cropStart + offTime) / 1000;
				const duration = (this.cropEnd - this.#cropStart - offTime) / 1000;
				this.#temporalSource.start(when, offset, duration);
			}

			// timer
			this.#temporalTimer = setInterval(() => {
				this.#timePlaying += 100;
				this.#ObservableEvents.emit("PLAYING", this.timePlaying);
			}, 100);

			// volument & conect
			this.#temporalGainNode = context.createGain();
			this.#temporalGainNode.gain.value = this.#volumen;
			this.#temporalSource
				.connect(this.#temporalGainNode)
				.connect(context.destination);
		}
	}

	pause() {
		if (
			["playing", "playingSelf"].includes(this.state) &&
			this.#temporalSource
		) {
			// resetTime
			if (this.state === "playing") this.timePlaying = 0;

			this.state = "stop";
			// nodeSource
			this.#temporalSource.stop();
			this.#temporalSource = undefined;

			// timer
			clearInterval(this.#temporalTimer);
			this.#temporalTimer = undefined;
		}
	}

	playSelf() {
		const context = new AudioContext();
		const timeInit = this.timePlaying;
		this.play(context, timeInit, true);
	}

	static formatTime(milisencods = 0, type = ["H", "M", "S"]) {
		const lastNum = num =>
			("0000" + num)
				.split("")
				.reverse()
				.slice(0, 2)
				.reverse()
				.join()
				.replace(",", "");
		const MS = ((milisencods % 1000) + "0000000").slice(0, 2);
		const S = lastNum(Math.floor(milisencods / 1000));
		const M = lastNum(Math.floor(milisencods / 1000 / 60));
		const H = lastNum(Math.floor(milisencods / 1000 / 60 / 60));
		const values = {
			H,
			M,
			S,
			MS,
		};
		const result = type.reduce((acc, cur) => {
			if (acc.length) return acc + ":" + values[cur];
			return values[cur];
		}, "");
		return result;
	}

	addListenerEvent(event, callback) {
		return this.#ObservableEvents.subscribe(event, callback);
	}

	getLink() {
		if (this.#option.src.size) return URL.createObjectURL(this.#option.src);
		else return this.#option.src;
	}
}
