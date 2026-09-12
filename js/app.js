import { predefinedSearches, supportedPeriods } from './config.js';
import { detectOutliers } from './analysis/outliers.js';
import { findHiddenGems } from './analysis/hiddenGems.js';
import { ChannelService } from './services/channelService.js';
import { SearchService } from './services/searchService.js';
import { getStartDate } from './utils/dates.js';
import { sortVideos } from './utils/sorting.js';
import {
  parseMinimumViews,
  validateChannelIdentifier,
  validateKeyword,
} from './utils/validation.js';
import {
  renderApplication,
  renderChannelEmpty,
  renderChannelError,
  renderChannelLoading,
  renderChannelResults,
  renderHiddenGemsEmpty,
  renderHiddenGemsError,
  renderHiddenGemsLoading,
  renderHiddenGemsResults,
  renderEmpty,
  renderError,
  renderLoading,
  renderResults,
} from './ui/renderer.js';

const appElement = document.querySelector('#app');

if (appElement) {
  const searchService = new SearchService();
  const channelService = new ChannelService();
  const view = renderApplication(appElement, {
    predefinedSearches,
    periods: {
      '7d': supportedPeriods.last7Days,
      '14d': supportedPeriods.last14Days,
      '2m': supportedPeriods.last2Months,
      '3m': supportedPeriods.last3Months,
      '6m': supportedPeriods.last6Months,
      '12m': supportedPeriods.last12Months,
    },
    onSearch: handleSearch,
    onChannelSearch: handleChannelSearch,
    onHiddenGemsSearch: handleHiddenGemsSearch,
  });

  async function handleSearch({ keyword, period, minViews, sortBy, excludeShorts }) {
    renderLoading(view);

    try {
      const validatedKeyword = validateKeyword(keyword);
      const validatedMinViews = parseMinimumViews(minViews);
      const videos = await searchService.searchGlobal({
        keyword: validatedKeyword,
        sinceDate: getStartDate(period),
        minViews: validatedMinViews,
        maxResults: 50,
        excludeShorts,
      });
      const analyzedVideos = detectOutliers(videos);

      if (analyzedVideos.length === 0) {
        renderEmpty(view);
        return;
      }

      renderResults(view, sortVideos(analyzedVideos, sortBy));
    } catch (error) {
      console.error('Error en la búsqueda global:', error);
      renderError(view, error);
    }
  }

  async function handleChannelSearch({ identifier, period, sortBy, excludeShorts }) {
    renderChannelLoading(view);

    try {
      const normalizedIdentifier = validateChannelIdentifier(identifier);
      const channelId = normalizedIdentifier.startsWith('@')
        ? await channelService.resolveHandle(normalizedIdentifier)
        : normalizedIdentifier;

      if (!channelId) {
        const error = new Error('No se ha encontrado el canal indicado.');
        error.code = 'CHANNEL_NOT_FOUND';
        throw error;
      }

      const channel = await channelService.getChannelStatistics(channelId);
      if (!channel) {
        const error = new Error('No se ha encontrado el canal indicado.');
        error.code = 'CHANNEL_NOT_FOUND';
        throw error;
      }

      const videos = await searchService.getChannelVideos({
        channelId,
        publishedAfter: getStartDate(period),
        maxResults: 50,
        excludeShorts,
      });
      const analyzedVideos = detectOutliers(videos);

      if (analyzedVideos.length === 0) {
        renderChannelEmpty(view, channel);
        return;
      }

      renderChannelResults(view, channel, sortVideos(analyzedVideos, sortBy));
    } catch (error) {
      console.error('Error en el análisis del canal:', error);
      renderChannelError(view, error);
    }
  }

  async function handleHiddenGemsSearch({ gameId, period, minimumRatio, sortBy }) {
    renderHiddenGemsLoading(view);

    try {
      const configuredSearch = predefinedSearches[gameId];
      if (!configuredSearch) {
        throw new Error('La búsqueda predefinida seleccionada no existe.');
      }

      const videos = await searchService.searchGlobal({
        keyword: configuredSearch.searchQuery,
        sinceDate: getStartDate(period),
        maxResults: 50,
      });
      const videosWithChannels = await channelService.enrichVideosWithChannelStatistics(videos);
      const hiddenGems = findHiddenGems(videosWithChannels, {
        minimumRatio,
      });

      if (hiddenGems.length === 0) {
        renderHiddenGemsEmpty(view);
        return;
      }

      renderHiddenGemsResults(view, sortVideos(hiddenGems, sortBy));
    } catch (error) {
      console.error('Error en el análisis de Gemas Ocultas:', error);
      renderHiddenGemsError(view, error);
    }
  }
}
