export const SORT_OPTIONS = {
	views: 'Más visualizaciones',
	zScore: 'Mayor z-score',
	newest: 'Más reciente',
};

export const HIDDEN_GEMS_SORT_OPTIONS = {
	ratio: 'Ratio views/suscriptores',
	...SORT_OPTIONS,
};

export function sortVideos(videos, sortBy = 'views') {
	return [...videos].sort((left, right) => {
		if (sortBy === 'zScore') {
			return toNumber(right.zScore) - toNumber(left.zScore);
		}

		if (sortBy === 'newest') {
			return getTime(right.publishedAt) - getTime(left.publishedAt);
		}

		if (sortBy === 'ratio') {
			return toNumber(right.ratio) - toNumber(left.ratio);
		}

		return toNumber(right.views) - toNumber(left.views);
	});
}

function toNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

function getTime(value) {
	const time = new Date(value).getTime();
	return Number.isFinite(time) ? time : 0;
}
