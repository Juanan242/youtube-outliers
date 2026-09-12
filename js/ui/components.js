import { formatDate, formatNumber } from '../utils/formatters.js';
import { HIDDEN_GEMS_SORT_OPTIONS, SORT_OPTIONS } from '../utils/sorting.js';

export function createSearchForm({ periods, predefinedSearches, onSubmit }) {
	const form = document.createElement('form');
	form.className = 'search-form';
	form.setAttribute('aria-label', 'Buscar vídeos');

	const keywordField = createField('Palabra clave', 'search-keyword', 'text');
	keywordField.input.placeholder = 'Ej. Dragon Ball, GTA 6...';
	keywordField.input.required = true;

	const periodField = createPeriodField(periods, 'search-period');
	const sortField = createSortField(SORT_OPTIONS, 'search-sort');

	const minViewsField = createField('Visualizaciones mínimas', 'search-min-views', 'number');
	minViewsField.input.min = '0';
	minViewsField.input.max = '1000000000000';
	minViewsField.input.step = '1';
	minViewsField.input.value = '3000';
	const excludeShortsField = createCheckboxField('Excluir Shorts', 'search-exclude-shorts');

	const submitButton = document.createElement('button');
	submitButton.type = 'submit';
	submitButton.className = 'button button-primary';
	submitButton.textContent = 'Buscar vídeos';

	const predefinedSearchesPanel = createPredefinedSearches({
		searches: predefinedSearches,
		onSelect: (searchQuery) => onSubmit({
			keyword: searchQuery,
			period: periodField.input.value,
			minViews: minViewsField.input.value,
			sortBy: sortField.input.value,
			excludeShorts: excludeShortsField.input.checked,
		}),
	});

	form.append(
		keywordField.wrapper,
		periodField.wrapper,
		sortField.wrapper,
		minViewsField.wrapper,
		excludeShortsField.wrapper,
		submitButton,
		predefinedSearchesPanel,
	);
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		onSubmit({
			keyword: keywordField.input.value,
			period: periodField.input.value,
			minViews: minViewsField.input.value,
			sortBy: sortField.input.value,
				excludeShorts: excludeShortsField.input.checked,
		});
	});

	return form;
}

export function createChannelForm({ periods, onSubmit }) {
	const form = document.createElement('form');
	form.className = 'search-form channel-form';
	form.setAttribute('aria-label', 'Analizar canal');

	const channelField = createField('Handle o ID del canal', 'channel-identifier', 'text');
	channelField.input.placeholder = '@nombre o channel ID';
	channelField.input.required = true;

	const periodField = createPeriodField(periods, 'channel-period');
	const sortField = createSortField(SORT_OPTIONS, 'channel-sort');
	const excludeShortsField = createCheckboxField('Excluir Shorts', 'channel-exclude-shorts');
	const submitButton = document.createElement('button');
	submitButton.type = 'submit';
	submitButton.className = 'button button-primary';
	submitButton.textContent = 'Analizar canal';

	form.append(channelField.wrapper, periodField.wrapper, sortField.wrapper, excludeShortsField.wrapper, submitButton);
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		onSubmit({
			identifier: channelField.input.value,
			period: periodField.input.value,
			sortBy: sortField.input.value,
				excludeShorts: excludeShortsField.input.checked,
		});
	});

	return form;
}

export function createHiddenGemsForm({ periods, predefinedSearches, onSubmit }) {
	const form = document.createElement('form');
	form.className = 'search-form hidden-gems-form';
	form.setAttribute('aria-label', 'Buscar Gemas Ocultas');

	const gameField = createField('Juego', 'hidden-gems-game', 'select');
	for (const search of Object.values(predefinedSearches)) {
		const option = document.createElement('option');
		option.value = search.id;
		option.textContent = search.label;
		gameField.input.append(option);
	}

	const periodField = createPeriodField(periods, 'hidden-gems-period');
	const sortField = createSortField(HIDDEN_GEMS_SORT_OPTIONS, 'hidden-gems-sort');
	const ratioField = createField('Ratio mínimo', 'hidden-gems-ratio', 'select');
	for (const ratio of [1, 2, 3]) {
		const option = document.createElement('option');
		option.value = ratio;
		option.textContent = `${ratio}x`;
		ratioField.input.append(option);
	}

	const submitButton = document.createElement('button');
	submitButton.type = 'submit';
	submitButton.className = 'button button-primary';
	submitButton.textContent = 'Buscar Gemas Ocultas';

	form.append(gameField.wrapper, periodField.wrapper, sortField.wrapper, ratioField.wrapper, submitButton);
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		onSubmit({
			gameId: gameField.input.value,
			period: periodField.input.value,
			minimumRatio: ratioField.input.value,
			sortBy: sortField.input.value,
		});
	});

	return form;
}

function createPredefinedSearches({ searches, onSelect }) {
	const panel = document.createElement('div');
	panel.className = 'predefined-searches';

	const label = document.createElement('span');
	label.className = 'predefined-searches-label';
	label.textContent = 'Búsquedas rápidas';
	panel.append(label);

	const buttons = document.createElement('div');
	buttons.className = 'predefined-searches-buttons';
	for (const search of Object.values(searches)) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'button button-secondary';
		button.textContent = search.label;
		button.addEventListener('click', () => onSelect(search.searchQuery));
		buttons.append(button);
	}

	panel.append(buttons);
	return panel;
}

export function createVideoCard(video) {
	const article = document.createElement('article');
	article.className = 'video-card';

	const thumbnail = document.createElement('img');
	thumbnail.className = 'video-card-thumbnail';
	thumbnail.src = video.thumbnail ?? '';
	thumbnail.alt = `Miniatura de ${video.title}`;
	thumbnail.loading = 'lazy';

	const content = document.createElement('div');
	content.className = 'video-card-content';

	const title = document.createElement('h3');
	const link = document.createElement('a');
	link.href = video.url ?? '#';
	link.target = '_blank';
	link.rel = 'noreferrer';
	link.textContent = video.title || 'Vídeo sin título';
	title.append(link);

	const channel = document.createElement('p');
	channel.className = 'video-card-channel';
	channel.textContent = video.channelTitle || 'Canal desconocido';

	const metrics = document.createElement('dl');
	metrics.className = 'video-card-metrics';
	appendMetric(metrics, 'Visualizaciones', formatNumber(video.views));
	appendMetric(metrics, 'Fecha', formatDate(video.publishedAt));
	if (video.subscriberCount !== undefined) {
		appendMetric(metrics, 'Suscriptores', formatNumber(video.subscriberCount));
	}
	if (video.ratio !== undefined) {
		appendMetric(metrics, 'Ratio', `${video.ratio.toFixed(2)}x`);
	}
	if (video.zScore !== undefined) {
		appendMetric(metrics, 'Z-score', video.zScore.toFixed(2));
	}

	content.append(title, channel, metrics);
	article.append(thumbnail, content);
	return article;
}

export function createChannelSummary(channel) {
	const summary = document.createElement('section');
	summary.className = 'channel-summary';

	const title = document.createElement('h2');
	title.textContent = channel.title || 'Canal';
	const handle = document.createElement('p');
	handle.textContent = channel.handle || channel.id || '';
	const subscribers = document.createElement('p');
	subscribers.textContent = `Suscriptores: ${formatNumber(channel.subscriberCount)}`;

	summary.append(title, handle, subscribers);
	return summary;
}

function createPeriodField(periods, id) {
	const periodField = createField('Periodo', id, 'select');
	for (const [value, period] of Object.entries(periods)) {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = period.label;
		periodField.input.append(option);
	}

	return periodField;
}

function createSortField(options, id) {
	const sortField = createField('Ordenar por', id, 'select');
	for (const [value, label] of Object.entries(options)) {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = label;
		sortField.input.append(option);
	}

	return sortField;
}

function createCheckboxField(labelText, id) {
	const wrapper = document.createElement('label');
	wrapper.className = 'checkbox-field';
	wrapper.htmlFor = id;

	const input = document.createElement('input');
	input.id = id;
	input.name = id;
	input.type = 'checkbox';

	const label = document.createElement('span');
	label.textContent = labelText;
	wrapper.append(input, label);
	return { wrapper, input };
}

function createField(labelText, id, type) {
	const wrapper = document.createElement('label');
	wrapper.className = 'field';
	wrapper.htmlFor = id;

	const label = document.createElement('span');
	label.textContent = labelText;
	const input = document.createElement(type === 'select' ? 'select' : 'input');
	input.id = id;
	input.name = id;
	if (type !== 'select') {
		input.type = type;
	}

	wrapper.append(label, input);
	return { wrapper, input };
}

function appendMetric(metrics, labelText, value) {
	const label = document.createElement('dt');
	label.textContent = labelText;
	const data = document.createElement('dd');
	data.textContent = value;
	metrics.append(label, data);
}
