export class ApiKeyManager {
	constructor(keys = []) {
		this.keys = keys.filter((key) => typeof key === 'string' && key.trim());
		this.currentIndex = 0;
		this.exhaustedKeys = new Set();
	}

	getCurrentKey() {
		if (this.keys.length === 0) {
			const error = new Error('No hay API keys de YouTube configuradas.');
			error.code = 'YOUTUBE_API_KEYS_MISSING';
			throw error;
		}

		const key = this.findAvailableKey();
		if (!key) {
			throw this.createExhaustedError();
		}

		return key;
	}

	hasCurrentKey() {
		return Boolean(this.findAvailableKey());
	}

	hasNextKey() {
		return this.findAvailableKey(this.currentIndex + 1) !== null;
	}

	useNextKey() {
		const nextIndex = this.findAvailableIndex(this.currentIndex + 1);
		if (nextIndex === -1) {
			throw this.createExhaustedError();
		}

		this.currentIndex = nextIndex;
		return this.keys[nextIndex];
	}

	markKeyExhausted(key) {
		const keyIndex = this.keys.indexOf(key);
		if (keyIndex === -1) {
			return false;
		}

		this.exhaustedKeys.add(key);
		if (keyIndex === this.currentIndex) {
			const nextIndex = this.findAvailableIndex(keyIndex + 1);
			this.currentIndex = nextIndex === -1 ? this.keys.length : nextIndex;
		}

		return true;
	}

	isKeyExhausted(key) {
		return this.exhaustedKeys.has(key);
	}

	findAvailableKey(startIndex = this.currentIndex) {
		const availableIndex = this.findAvailableIndex(startIndex);
		return availableIndex === -1 ? null : this.keys[availableIndex];
	}

	findAvailableIndex(startIndex) {
		for (let index = Math.max(0, startIndex); index < this.keys.length; index += 1) {
			if (!this.exhaustedKeys.has(this.keys[index])) {
				return index;
			}
		}

		return -1;
	}

	createExhaustedError() {
		const error = new Error('Se ha agotado la cuota disponible de YouTube API.');
		error.code = 'YOUTUBE_QUOTA_EXHAUSTED';
		return error;
	}
}
