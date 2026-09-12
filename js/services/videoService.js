import { YouTubeClient } from '../api/youtube.js';
import { parseDurationToSeconds } from '../utils/duration.js';

const MAX_VIDEO_IDS_PER_REQUEST = 50;

export class VideoService {
	constructor({ youtubeClient = new YouTubeClient() } = {}) {
		this.youtubeClient = youtubeClient;
	}

	async getVideoStatistics(videoIds) {
		const ids = this.uniqueIds(videoIds);
		const videos = [];

		for (const idBatch of this.chunk(ids, MAX_VIDEO_IDS_PER_REQUEST)) {
			const response = await this.youtubeClient.videosList({
				id: idBatch.join(','),
			});
			videos.push(...(response.items ?? []).map((item) => this.normalizeVideo(item)));
		}

		return videos;
	}

	normalizeVideo(item) {
		const snippet = item?.snippet ?? {};
		const statistics = item?.statistics ?? {};
		const contentDetails = item?.contentDetails ?? {};
		const videoId = typeof item?.id === 'string' ? item.id : item?.id?.videoId;
		const durationSeconds = parseDurationToSeconds(contentDetails.duration);

		return {
			id: videoId ?? null,
			title: snippet.title ?? '',
			description: snippet.description ?? '',
			views: this.toNumber(statistics.viewCount),
			likes: this.toNumber(statistics.likeCount),
			publishedAt: snippet.publishedAt ?? null,
			duration: contentDetails.duration ?? null,
			durationSeconds,
			thumbnail: this.getThumbnail(snippet.thumbnails),
			channelId: snippet.channelId ?? null,
			channelTitle: snippet.channelTitle ?? '',
			categoryId: snippet.categoryId ?? null,
			tags: Array.isArray(snippet.tags) ? snippet.tags : [],
			url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
		};
	}

	getThumbnail(thumbnails = {}) {
		return thumbnails.maxres?.url
			?? thumbnails.high?.url
			?? thumbnails.medium?.url
			?? thumbnails.default?.url
			?? null;
	}

	toNumber(value) {
		const number = Number(value);
		return Number.isFinite(number) ? number : 0;
	}

	uniqueIds(ids = []) {
		return [...new Set(ids.filter((id) => typeof id === 'string' && id.trim()))];
	}

	chunk(items, size) {
		const batches = [];

		for (let index = 0; index < items.length; index += size) {
			batches.push(items.slice(index, index + size));
		}

		return batches;
	}
}
