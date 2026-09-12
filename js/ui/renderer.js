import {
	createChannelForm,
	createChannelSummary,
	createHiddenGemsForm,
	createSearchForm,
	createVideoCard,
} from './components.js';

export function renderApplication(root, {
	periods,
	predefinedSearches,
	onSearch,
	onChannelSearch,
	onHiddenGemsSearch,
}) {
	root.replaceChildren();

	const header = document.createElement('header');
	header.className = 'page-header';
	const title = document.createElement('h1');
	title.textContent = 'YouTube Outliers';
	const subtitle = document.createElement('p');
	subtitle.textContent = 'Encuentra vídeos con un rendimiento fuera de lo común.';
	const themeButton = document.createElement('button');
	themeButton.type = 'button';
	themeButton.className = 'theme-toggle';
	themeButton.setAttribute('aria-label', 'Cambiar a modo claro');
	themeButton.textContent = '☀️';
	themeButton.addEventListener('click', () => {
		const isLight = document.documentElement.dataset.theme === 'light';
		document.documentElement.dataset.theme = isLight ? 'dark' : 'light';
		themeButton.textContent = isLight ? '☀️' : '🌙';
		themeButton.setAttribute('aria-label', isLight ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
	});
	header.append(title, subtitle, themeButton);

	const form = createSearchForm({ periods, predefinedSearches, onSubmit: onSearch });
	const channelForm = createChannelForm({ periods, onSubmit: onChannelSearch });
	const channelStatus = document.createElement('section');
	channelStatus.className = 'status-panel';
	channelStatus.setAttribute('aria-live', 'polite');
	channelStatus.textContent = 'Introduce un handle o channel ID para analizar un canal.';
	const channelSummary = document.createElement('div');
	const channelResults = document.createElement('section');
	channelResults.className = 'results-grid';
	channelResults.setAttribute('aria-label', 'Resultados del canal');
	const hiddenGemsForm = createHiddenGemsForm({
		periods,
		predefinedSearches,
		onSubmit: onHiddenGemsSearch,
	});
	const hiddenGemsStatus = document.createElement('section');
	hiddenGemsStatus.className = 'status-panel';
	hiddenGemsStatus.setAttribute('aria-live', 'polite');
	hiddenGemsStatus.textContent = 'Selecciona un juego y un ratio mínimo para encontrar Gemas Ocultas.';
	const hiddenGemsResults = document.createElement('section');
	hiddenGemsResults.className = 'results-grid';
	hiddenGemsResults.setAttribute('aria-label', 'Resultados Gemas Ocultas');
	const status = document.createElement('section');
	status.className = 'status-panel';
	status.setAttribute('aria-live', 'polite');
	status.textContent = 'Introduce una palabra clave para comenzar.';
	const results = document.createElement('section');
	results.className = 'results-grid';
	results.setAttribute('aria-label', 'Resultados');

	const channelSectionTitle = document.createElement('h2');
	channelSectionTitle.className = 'section-title';
	channelSectionTitle.textContent = 'Analizar un canal';
	const hiddenGemsSectionTitle = document.createElement('h2');
	hiddenGemsSectionTitle.className = 'section-title';
	hiddenGemsSectionTitle.textContent = 'Gemas Ocultas';
	const modeNavigation = document.createElement('nav');
	modeNavigation.className = 'mode-navigation';
	modeNavigation.setAttribute('aria-label', 'Tipo de análisis');
	const modeSections = {
		search: [form, status, results],
		channel: [channelSectionTitle, channelForm, channelStatus, channelSummary, channelResults],
		hiddenGems: [hiddenGemsSectionTitle, hiddenGemsForm, hiddenGemsStatus, hiddenGemsResults],
	};
	for (const [mode, label] of [['search', 'Buscar vídeos'], ['channel', 'Analizar un canal'], ['hiddenGems', 'Gemas Ocultas']]) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'button mode-button';
		button.textContent = label;
		button.addEventListener('click', () => setActiveMode(mode, modeSections, modeNavigation));
		modeNavigation.append(button);
	}
	root.append(
		header,
		modeNavigation,
		...modeSections.search,
		...modeSections.channel,
		...modeSections.hiddenGems,
	);
	setActiveMode('search', modeSections, modeNavigation);
	return {
		form,
		status,
		results,
		channelForm,
		channelStatus,
		channelSummary,
		channelResults,
		hiddenGemsForm,
		hiddenGemsStatus,
		hiddenGemsResults,
	};
}

function setActiveMode(activeMode, modeSections, navigation) {
	for (const [mode, elements] of Object.entries(modeSections)) {
		const isActive = mode === activeMode;
		elements.forEach((element) => {
			element.hidden = !isActive;
		});
	}

	[...navigation.children].forEach((button, index) => {
		const mode = Object.keys(modeSections)[index];
		button.classList.toggle('is-active', mode === activeMode);
	});
}

export function renderLoading(view) {
	view.status.className = 'status-panel status-loading';
	view.status.textContent = 'Buscando vídeos...';
	view.results.replaceChildren();
}

export function renderEmpty(view) {
	view.status.className = 'status-panel status-empty';
	view.status.textContent = 'No se encontraron vídeos con esos criterios.';
	view.results.replaceChildren();
}

export function renderError(view, error) {
	view.status.className = 'status-panel status-error';
	view.status.textContent = getErrorMessage(error);
	view.results.replaceChildren();
}

export function renderResults(view, videos) {
	view.status.className = 'status-panel status-success';
	view.status.textContent = `${videos.length} vídeo${videos.length === 1 ? '' : 's'} encontrado${videos.length === 1 ? '' : 's'}.`;
	view.results.replaceChildren(...videos.map(createVideoCard));
}

export function renderChannelLoading(view) {
	view.channelStatus.className = 'status-panel status-loading';
	view.channelStatus.textContent = 'Analizando canal...';
	view.channelSummary.replaceChildren();
	view.channelResults.replaceChildren();
}

export function renderChannelEmpty(view, channel) {
	view.channelStatus.className = 'status-panel status-empty';
	view.channelStatus.textContent = 'El canal no tiene vídeos en el periodo seleccionado.';
	view.channelSummary.replaceChildren(createChannelSummary(channel));
	view.channelResults.replaceChildren();
}

export function renderChannelError(view, error) {
	view.channelStatus.className = 'status-panel status-error';
	view.channelStatus.textContent = getErrorMessage(error);
	view.channelSummary.replaceChildren();
	view.channelResults.replaceChildren();
}

export function renderChannelResults(view, channel, videos) {
	view.channelStatus.className = 'status-panel status-success';
	view.channelStatus.textContent = `${videos.length} vídeo${videos.length === 1 ? '' : 's'} encontrado${videos.length === 1 ? '' : 's'} en el canal.`;
	view.channelSummary.replaceChildren(createChannelSummary(channel));
	view.channelResults.replaceChildren(...videos.map(createVideoCard));
}

export function renderHiddenGemsLoading(view) {
	view.hiddenGemsStatus.className = 'status-panel status-loading';
	view.hiddenGemsStatus.textContent = 'Buscando Gemas Ocultas...';
	view.hiddenGemsResults.replaceChildren();
}

export function renderHiddenGemsEmpty(view) {
	view.hiddenGemsStatus.className = 'status-panel status-empty';
	view.hiddenGemsStatus.textContent = 'No se encontraron Gemas Ocultas con esos criterios.';
	view.hiddenGemsResults.replaceChildren();
}

export function renderHiddenGemsError(view, error) {
	view.hiddenGemsStatus.className = 'status-panel status-error';
	view.hiddenGemsStatus.textContent = getErrorMessage(error);
	view.hiddenGemsResults.replaceChildren();
}

export function renderHiddenGemsResults(view, videos) {
	view.hiddenGemsStatus.className = 'status-panel status-success';
	view.hiddenGemsStatus.textContent = `${videos.length} gema${videos.length === 1 ? '' : 's'} oculta${videos.length === 1 ? '' : 's'} encontrada${videos.length === 1 ? '' : 's'}.`;
	view.hiddenGemsResults.replaceChildren(...videos.map(createVideoCard));
}

function getErrorMessage(error) {
	if (error?.code === 'YOUTUBE_QUOTA_EXHAUSTED') {
		return 'Se ha agotado la cuota disponible de la API de YouTube.';
	}

	if (error?.code === 'YOUTUBE_API_KEYS_MISSING') {
		return 'La aplicación no tiene configuradas las API keys de YouTube.';
	}

	if (error?.code === 'CHANNEL_NOT_FOUND' || error?.reason === 'channelNotFound') {
		return 'No se ha encontrado el canal indicado.';
	}

	if (error instanceof TypeError || error?.name === 'AbortError') {
		return 'Error de conexión. No se ha podido contactar con YouTube.';
	}

	if (error?.status >= 500 || error?.code?.startsWith('HTTP_')) {
		return 'No se ha podido realizar la consulta. Inténtalo de nuevo.';
	}

	return error?.message?.startsWith('Introduce ')
		? error.message
		: 'No se ha podido realizar la consulta. Inténtalo de nuevo.';
}
