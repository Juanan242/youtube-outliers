export function calculateMean(values) {
	if (values.length === 0) {
		return 0;
	}

	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateStandardDeviation(values, mean = calculateMean(values)) {
	if (values.length === 0) {
		return 0;
	}

	const variance = values.reduce(
		(sum, value) => sum + (value - mean) ** 2,
		0,
	) / values.length;

	return Math.sqrt(variance);
}

export function detectOutliers(videos = [], { minimumZScore = null } = {}) {
	const validVideos = videos.filter((video) => isValidViews(video?.views));
	if (validVideos.length === 0) {
		return [];
	}

	const views = validVideos.map((video) => Number(video.views));
	const mean = calculateMean(views);
	const standardDeviation = calculateStandardDeviation(views, mean);
	const threshold = normalizeMinimumZScore(minimumZScore);

	return validVideos
		.map((video, index) => ({
			...video,
			zScore: standardDeviation === 0
				? 0
				: (views[index] - mean) / standardDeviation,
		}))
		.filter((video) => threshold === null || video.zScore >= threshold);
}

function isValidViews(value) {
	return value !== null
		&& value !== ''
		&& Number.isFinite(Number(value));
}

function normalizeMinimumZScore(value) {
	if (value === null || value === undefined) {
		return null;
	}

	const threshold = Number(value);
	return Number.isFinite(threshold) ? threshold : null;
}
