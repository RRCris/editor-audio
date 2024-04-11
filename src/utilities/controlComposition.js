import { ObserverEventComposition } from "./ObserverEvent";

import toWav from "audiobuffer-to-wav";

export class CompositionControl {
	#ObservableEvent = new ObserverEventComposition();
	#state = "stop"; //stop | playing
	#audios = [];
	#timeCurrent = 0;
	#subscritors = [];
	#duration = 0;
	#timer;

	set timeCurrent(miliseconds) {
		if (
			Math.floor(this.#timeCurrent / 100) === Math.floor(this.#duration / 100)
		) {
			this.#timeCurrent = 0;
			this.pause();
		} else this.#timeCurrent = miliseconds;
		this.#ObservableEvent.emit("PLAYING", this.#timeCurrent);
	}
	get timeCurrent() {
		return this.#timeCurrent;
	}
	set audios(n) {
		//borra los listener de los audios anteriores
		this.#subscritors.forEach(sub => sub.unsubscribe());
		this.#subscritors = [];
		//actualiza con los nuevos audios
		this.#audios = n;
		//se verifica con los nuevos audios
		this.verifieDuration();
		//añade el listener a todos los audios si cambia la duracion
		this.#audios.forEach(aud => {
			this.#subscritors.push(
				aud.addListenerEvent("CHANGE_DURATION", () => this.verifieDuration())
			);
		});
		//fire event
		this.#ObservableEvent.emit("CHANGE_AUDIOS", n);
	}
	get audios() {
		return this.#audios;
	}
	set duration(miliseconds) {
		this.#duration = miliseconds;
		this.#ObservableEvent.emit("CHANGE_DURATION", miliseconds);
	}
	get duration() {
		return this.#duration;
	}
	get state() {
		return this.#state;
	}

	play() {
		//reproducir todas las composiciones
		const context = new AudioContext();
		for (const audio of this.audios) {
			audio.timePlaying = 0;
			audio.play(context, this.timeCurrent, false);
		}
		//fire event
		this.#state = "playing";
		this.#ObservableEvent.emit("CHANGE_STATE", this.#state);

		//timer
		this.#timer = setInterval(() => {
			this.timeCurrent += 100;
			const countPulse = Math.ceil(this.timeCurrent / 100);
			const totalPulse = Math.floor(this.duration / 100);

			if (countPulse >= totalPulse)
				this.#ObservableEvent.emit("END_PLAYING", this.timeCurrent);
		}, 100);
	}

	pause() {
		this.#state = "stop";
		//ejecutar
		for (const audio of this.audios) {
			audio.pause();
		}
		//fire event
		this.#ObservableEvent.emit("CHANGE_STATE", this.#state);

		//clear timer
		clearInterval(this.#timer);
		this.#timer = undefined;
	}

	addListenerEvent(eventListener, callback) {
		return this.#ObservableEvent.subscribe(eventListener, callback);
	}
	verifieDuration() {
		let dur = 0;
		this.#audios.forEach(aud => {
			if (aud.duration > dur) dur = aud.duration;
		});
		if (this.duration !== dur) this.duration = dur;
	}

	async export() {
		const channels = 2;
		const Khz = 44.1; //
		const context = new OfflineAudioContext({
			numberOfChannels: channels,
			length: this.#duration * Khz,
			sampleRate: Khz * 1000,
		});
		this.#audios.forEach(aud => aud.play(context, 0, false));
		const RenderAudioBuffer = await context.startRendering();
		//create File
		const wav = toWav(RenderAudioBuffer);
		const blob = new Blob([new DataView(wav)], { type: "audio/wav" });
		// const file = URL.createObjectURL(blob);

		return blob;
	}
}
