import { Subject } from "rxjs";

export const TypeEventsAudio = [
	"LOAD_END",
	"ERROR_LOAD",
	"CHANGE_STATE",
	"CHANGE_VOLUMEN",
	"CHANGE_DURATION",
	"CHANGE_DELAY",
	"PLAYING",
	"CHANGE_CROP_START",
	"CHANGE_CROP_END",
];
export class ObserverEventAudio {
	subject = new Subject();

	subscribe(eventSubscribe, callbackSubscribe) {
		if (!TypeEventsAudio.includes(eventSubscribe))
			throw new Error(
				`el evento ${eventSubscribe} no esta registrado, utilice ${TypeEventsAudio}`
			);
		return this.subject.subscribe(([event, value]) => {
			if (event === eventSubscribe) callbackSubscribe(value);
		});
	}

	emit(event, value) {
		if (!TypeEventsAudio.includes(event))
			throw new Error(
				`el evento ${event} no esta registrado, utilice ${TypeEventsAudio}`
			);
		this.subject.next([event, value]);
	}
}

export const TypeEventsComposition = [
	"CHANGE_STATE",
	"CHANGE_DURATION",
	"PLAYING",
	"CHANGE_AUDIOS",
	"END_PLAYING",
];
export class ObserverEventComposition {
	subject = new Subject();

	subscribe(eventSubscribe, callbackSubscribe) {
		if (!TypeEventsComposition.includes(eventSubscribe))
			throw new Error(
				`el evento ${eventSubscribe} no esta registrado, utilice ${TypeEventsComposition}`
			);

		return this.subject.subscribe(([event, value]) => {
			if (event === eventSubscribe) callbackSubscribe(value);
		});
	}

	emit(event, value) {
		if (!TypeEventsComposition.includes(event))
			throw new Error(
				`el evento ${event} no esta registrado, utilice ${TypeEventsAudio}`
			);

		this.subject.next([event, value]);
	}
}

export class ObserverRaw {
	subject = new Subject();

	subscribe(callbackSubscribe) {
		return this.subject.subscribe(callbackSubscribe);
	}

	emit(value) {
		this.subject.next(value);
	}
}
