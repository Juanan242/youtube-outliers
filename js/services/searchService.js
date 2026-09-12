import { YouTubeClient } from '../api/youtube.js';
import { VideoService } from './videoService.js';

const MAX_SEARCH_RESULTS_PER_REQUEST = 50;

export class SearchService {
	constructor({ youtubeClient = new YouTubeClient(), videoService } = {}) {
		this.youtubeClient = youtubeClient;
		this.videoService = videoService ?? new VideoService({ youtubeClient });
	}

	async getChannelVideos({ channelId, publishedAfter, maxResults = 50, pageToken, excludeShorts = false } = {}) {
		if (!channelId) {
			throw new Error('Se necesita un channelId para buscar vídeos del canal.');
		}

		if (!publishedAfter) {
			throw new Error('Se necesita una fecha inicial para buscar vídeos del canal.');
		}

		const publishedAfterIso = this.toIsoDate(publishedAfter);
		const videos = [];
		let nextPageToken = pageToken;

		while (videos.length < maxResults) {
			const remainingResults = maxResults - videos.length;
			const response = await this.youtubeClient.searchList({
				channelId,
				order: 'date',
				type: 'video',
				publishedAfter: publishedAfterIso,
				maxResults: Math.min(remainingResults, MAX_SEARCH_RESULTS_PER_REQUEST),
				...(nextPageToken ? { pageToken: nextPageToken } : {}),
			});
			const videoIds = (response.items ?? [])
				.map((item) => item.id?.videoId)
				.filter(Boolean);

			if (videoIds.length > 0) {
				const normalizedVideos = await this.videoService.getVideoStatistics(videoIds);
				videos.push(...this.filterShorts(normalizedVideos, excludeShorts));
			}

			nextPageToken = response.nextPageToken;
			if (!nextPageToken || videoIds.length === 0) {
				break;
			}
		}

		return videos.slice(0, maxResults);
	}

	async searchGlobal({ keyword, sinceDate, minViews = 0, maxResults = 50, excludeShorts = false } = {}) {
		if (!keyword?.trim()) {
			throw new Error('Se necesita una palabra clave para buscar vídeos.');
		}

		const maximumResults = this.normalizeMaxResults(maxResults);
		if (maximumResults === 0) {
			return [];
		}

		const minimumViews = this.normalizeMinViews(minViews);
		const publishedAfter = this.toIsoDate(sinceDate);
		const videos = [];
		const seenVideoIds = new Set();
		let nextPageToken;

		while (videos.length < maximumResults) {
			const remainingResults = maximumResults - videos.length;
			const response = await this.youtubeClient.searchList({
				q: keyword.trim(),
				type: 'video',
				publishedAfter,
				maxResults: Math.min(remainingResults, MAX_SEARCH_RESULTS_PER_REQUEST),
				...(nextPageToken ? { pageToken: nextPageToken } : {}),
			});
			const videoIds = (response.items ?? [])
				.map((item) => item.id?.videoId)
				.filter((videoId) => videoId && !seenVideoIds.has(videoId));

			videoIds.forEach((videoId) => seenVideoIds.add(videoId));
			if (videoIds.length > 0) {
				const normalizedVideos = await this.videoService.getVideoStatistics(videoIds);
				videos.push(...this.filterShorts(
					normalizedVideos.filter((video) => video.views >= minimumViews),
					excludeShorts,
				));
			}

			nextPageToken = response.nextPageToken;
			if (!nextPageToken || videoIds.length === 0) {
				break;
			}
		}

		return videos.slice(0, maximumResults);
	}

	normalizeMaxResults(value) {
		const number = Number(value);
		return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
	}

	normalizeMinViews(value) {
		const number = Number(value);
		return Number.isFinite(number) ? Math.max(0, number) : 0;
	}

	toIsoDate(value) {
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) {
			throw new Error('La fecha inicial de búsqueda no es válida.');
		}

		return date.toISOString();
	}

	filterShorts(videos, excludeShorts) {
		return excludeShorts
			? videos.filter((video) => video.durationSeconds >= 120)
			: videos;
	}
}
