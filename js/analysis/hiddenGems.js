const MINIMUM_VIDEO_DURATION_SECONDS = 180;

export function calculateHiddenGemRatio(views, subscriberCount) {

	if (!isValidPositiveNumber(views) || !isValidPositiveNumber(subscriberCount)) {
		return null;
	}

	return views / subscriberCount;
}

export function findHiddenGems(videos, { minimumRatio = 1 } = {}) {
	const ratioThreshold = normalizeMinimumRatio(minimumRatio);

	return videos
		.filter((video) => video?.durationSeconds >= MINIMUM_VIDEO_DURATION_SECONDS)
		.map((video) => ({
			video,
			ratio: calculateHiddenGemRatio(video.views, video.subscriberCount),
		}))
		.filter(({ ratio }) => ratio !== null && ratio >= ratioThreshold)
		.sort((left, right) => right.ratio - left.ratio)
		.map(({ video, ratio }) => ({ ...video, ratio }));
}

function normalizeMinimumRatio(value) {
	const ratio = Number(value);
	return Number.isFinite(ratio) ? Math.max(0, ratio) : 1;
}

function isValidPositiveNumber(value) {
	return Number.isFinite(Number(value)) && Number(value) > 0;
}
