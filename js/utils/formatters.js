const numberFormatter = new Intl.NumberFormat('es-ES');
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
});

export function formatNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) ? numberFormatter.format(number) : '0';
}

export function formatDate(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 'Fecha desconocida' : dateFormatter.format(date);
}
