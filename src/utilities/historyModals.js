import { ObserverRaw } from "./ObserverEvent";

export class HistoryModal {
	#history = [];
	change$ = new ObserverRaw();
	addNewModal(newModal) {
		this.#history.push(newModal);
		this.#update();
	}
	resetHistory(optionalNewModal) {
		this.#history = [];
		if (optionalNewModal) this.#history.push(optionalNewModal);
		this.#update();
	}

	getLastModal() {
		return this.#history[this.#history.length - 1];
	}

	backModal() {
		this.#history.pop();
		this.#update();
	}

	filterHistory(id) {
		this.#history = this.#history.filter(modal => modal.id !== id);
		this.#update();
	}

	#update() {
		this.change$.emit(this.getLastModal());
	}
}
