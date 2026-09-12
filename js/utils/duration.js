export function parseDurationToSeconds(duration) {
	if (typeof duration !== 'string') {
		return 0;
	}

	const match = duration.match(
		/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/,
	);

	if (!match) {
		return 0;
	}

	const [, days = 0, hours = 0, minutes = 0, seconds = 0] = match;
	return Number(days) * 86400
		+ Number(hours) * 3600
		+ Number(minutes) * 60
		+ Number(seconds);
}
