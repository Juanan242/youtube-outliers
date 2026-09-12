const PERIOD_DEFINITIONS = {
	'7d': { amount: 7, unit: 'days' },
	'14d': { amount: 14, unit: 'days' },
	'2m': { amount: 2, unit: 'months' },
	'3m': { amount: 3, unit: 'months' },
	'6m': { amount: 6, unit: 'months' },
	'12m': { amount: 12, unit: 'months' },
};

export function getStartDate(period, referenceDate = new Date()) {
	const definition = PERIOD_DEFINITIONS[period];

	if (!definition) {
		throw new Error(`Periodo no soportado: ${period}`);
	}

	const startDate = new Date(referenceDate);
	if (Number.isNaN(startDate.getTime())) {
		throw new Error('La fecha de referencia no es válida.');
	}

	if (definition.unit === 'days') {
		startDate.setDate(startDate.getDate() - definition.amount);
	} else {
		startDate.setMonth(startDate.getMonth() - definition.amount);
	}

	return startDate;
}
