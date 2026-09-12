import { apiKeys, YOUTUBE_API_BASE_URL } from '../config.js';
import { ApiKeyManager } from './apiKeyManager.js';

const QUOTA_ERROR_REASONS = new Set([
	'dailyLimitExceeded',
	'dailyLimitExceededUnreg',
	'quotaExceeded',
]);

export class YouTubeApiError extends Error {
	constructor(message, { code, status, reason, reasons, details, cause } = {}) {
		super(message);
		this.name = 'YouTubeApiError';
		this.code = code;
		this.status = status;
		this.reason = reason;
		this.reasons = reasons ?? (reason ? [reason] : []);
		this.details = details;
		this.cause = cause;
	}
}

export class YouTubeClient {
	constructor({ keys = apiKeys, baseUrl = YOUTUBE_API_BASE_URL, fetcher } = {}) {
		this.keyManager = new ApiKeyManager(keys);
		this.baseUrl = baseUrl;
		this.fetcher = fetcher ?? globalThis.fetch.bind(globalThis);
	}

	async request(endpoint, parameters = {}) {
		const attemptedKeys = new Set();
		if (this.keyManager.keys.length === 0) {
			throw new YouTubeApiError('No hay API keys de YouTube configuradas.', {
				code: 'YOUTUBE_API_KEYS_MISSING',
			});
		}

		while (this.keyManager.hasCurrentKey()) {
			const key = this.keyManager.getCurrentKey();
			if (attemptedKeys.has(key)) {
				break;
			}

			attemptedKeys.add(key);
			try {
				return await this.requestWithKey(endpoint, parameters, key);
			} catch (error) {
				if (!this.isQuotaError(error)) {
					throw error;
				}

				this.keyManager.markKeyExhausted(key);
			}
		}

		if (!this.keyManager.hasCurrentKey()) {
			throw new YouTubeApiError(
				'Se ha agotado la cuota disponible de YouTube API.',
				{ code: 'YOUTUBE_QUOTA_EXHAUSTED' },
			);
		}

		throw new YouTubeApiError('No hay una API key disponible para completar la petición.', {
			code: 'YOUTUBE_API_KEY_RETRY_EXHAUSTED',
		});
	}

	async requestWithCurrentKey(endpoint, parameters) {
		return this.requestWithKey(endpoint, parameters, this.keyManager.getCurrentKey());
	}

	async requestWithKey(endpoint, parameters, key) {
		const searchParams = new URLSearchParams({
			...parameters,
			key,
		});
		const response = await this.fetcher(`${this.baseUrl}/${endpoint}?${searchParams}`);
		const payload = await this.parseResponse(response);

		if (!response.ok) {
			throw this.createApiError(response, payload);
		}

		if (!payload || typeof payload !== 'object') {
			throw new YouTubeApiError('YouTube API devolvió una respuesta inesperada.', {
				code: 'YOUTUBE_INVALID_RESPONSE',
				status: response.status,
			});
		}

		return payload;
	}

	async searchList(parameters = {}) {
		return this.request('search', {
			part: 'snippet',
			...parameters,
		});
	}

	async videosList(parameters = {}) {
		return this.request('videos', {
			part: 'snippet,statistics,contentDetails',
			...parameters,
		});
	}

	async channelsList(parameters = {}) {
		return this.request('channels', {
			part: 'snippet,statistics',
			...parameters,
		});
	}

	async parseResponse(response) {
		try {
			return await response.json();
		} catch {
			throw new YouTubeApiError('YouTube API devolvió una respuesta no válida.', {
				code: 'YOUTUBE_INVALID_RESPONSE',
				status: response.status,
			});
		}
	}

	createApiError(response, payload) {
		const apiError = payload?.error;
		const reasons = Array.isArray(apiError?.errors)
			? apiError.errors.map((error) => error?.reason).filter(Boolean)
			: [];
		const reason = reasons[0];

		return new YouTubeApiError(
			apiError?.message ?? `La petición a YouTube API falló con HTTP ${response.status}.`,
			{
				code: reason ?? `HTTP_${response.status}`,
				status: response.status,
				reason,
				reasons,
				details: payload,
			},
		);
	}

	isQuotaError(error) {
		return error instanceof YouTubeApiError
			&& error.reasons?.some((reason) => QUOTA_ERROR_REASONS.has(reason));
	}
}
