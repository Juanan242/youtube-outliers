export function validateKeyword(value) {
  const keyword = normalizeText(value);
  if (keyword.length < 2) {
    throw new Error('Introduce un término de búsqueda válido.');
  }

  if (keyword.length > 120) {
    throw new Error('El término de búsqueda es demasiado largo.');
  }

  return keyword;
}

export function validateChannelIdentifier(value) {
  const identifier = normalizeText(value);
  if (identifier.length < 2) {
    throw new Error('Introduce un handle o channel ID válido.');
  }

  if (identifier.length > 100) {
    throw new Error('El identificador del canal es demasiado largo.');
  }

  return identifier;
}

export function parseMinimumViews(value) {
  const views = Number(value);
  if (!Number.isInteger(views) || views < 0 || views > 1000000000000) {
    throw new Error('Introduce un número de visualizaciones válido.');
  }

  return views;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}
