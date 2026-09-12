import { YouTubeClient } from '../api/youtube.js';

const MAX_CHANNEL_IDS_PER_REQUEST = 50;

export class ChannelService {
	constructor({ youtubeClient = new YouTubeClient() } = {}) {
		this.youtubeClient = youtubeClient;
	}

	async getChannelStatistics(channelId) {
		if (!channelId) {
			throw new Error('Se necesita un channelId para obtener el canal.');
		}

		const channels = await this.getChannelsStatistics([channelId]);
		return channels[0] ?? null;
	}

	async getChannelsStatistics(channelIds) {
		const ids = this.uniqueIds(channelIds);
		const channels = [];

		for (const idBatch of this.chunk(ids, MAX_CHANNEL_IDS_PER_REQUEST)) {
			const response = await this.youtubeClient.channelsList({
				id: idBatch.join(','),
			});
			channels.push(...(response.items ?? []).map((item) => this.normalizeChannel(item)));
		}

		return channels;
	}

	async enrichVideosWithChannelStatistics(videos) {
		const channelIds = this.uniqueIds(videos.map((video) => video?.channelId));
		const channelCache = new Map();

		for (const channel of await this.getChannelsStatistics(channelIds)) {
			if (channel?.id) {
				channelCache.set(channel.id, channel);
			}
		}

		return videos.map((video) => ({
			...video,
			...(channelCache.get(video?.channelId)
				? {
					subscriberCount: channelCache.get(video.channelId).subscriberCount,
					channelHandle: channelCache.get(video.channelId).handle,
				}
				: {}),
		}));
	}

	async resolveHandle(handle) {
		const normalizedHandle = this.normalizeHandle(handle);

		if (!normalizedHandle) {
			throw new Error('Se necesita un handle válido para resolver el canal.');
		}

		const response = await this.youtubeClient.channelsList({
			forHandle: normalizedHandle,
		});
		return response.items?.[0]?.id ?? null;
	}

	normalizeChannel(item) {
		if (!item) {
			return null;
		}

		const snippet = item.snippet ?? {};
		const statistics = item.statistics ?? {};
		const customUrl = snippet.customUrl ?? null;

		return {
			id: item.id ?? null,
			title: snippet.title ?? '',
			description: snippet.description ?? '',
			handle: customUrl && customUrl.startsWith('@') ? customUrl : customUrl ? `@${customUrl}` : null,
			subscriberCount: this.toNumber(statistics.subscriberCount),
			hiddenSubscriberCount: statistics.hiddenSubscriberCount === true,
			thumbnail: snippet.thumbnails?.high?.url
				?? snippet.thumbnails?.medium?.url
				?? snippet.thumbnails?.default?.url
				?? null,
		};
	}

	toNumber(value) {
		const number = Number(value);
		return Number.isFinite(number) ? number : 0;
	}

	normalizeHandle(handle) {
		return typeof handle === 'string' ? handle.trim().replace(/^@/, '') : '';
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
