/**
 * Converts a plain object into a Record<string, string> suitable for HttpClient params.
 * Skips null, undefined, and empty string values automatically.
 */
export function buildHttpParams(filters: object): Record<string, string> {
  return Object.entries(filters).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      acc[key] = String(value);
    }
    return acc;
  }, {});
}
