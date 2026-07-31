type HttpParamValue = string | ReadonlyArray<string | number>;

/**
 * Converts a plain object into params suitable for HttpClient. Skips null,
 * undefined, and empty string/array values automatically.
 *
 * Array values are passed through as-is (not joined into a CSV string) —
 * Angular's HttpClient serializes each entry as a repeated query key
 * (`organizationIds=1&organizationIds=2`), which is what FastAPI expects for
 * a `list[int]` filter param.
 */
export function buildHttpParams(filters: object): Record<string, HttpParamValue> {
  return Object.entries(filters).reduce<Record<string, HttpParamValue>>((acc, [key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) acc[key] = value;
      return acc;
    }
    const isNumericNaN = typeof value === 'number' && Number.isNaN(value);
    if (value !== null && value !== undefined && value !== '' && !isNumericNaN) {
      acc[key] = String(value);
    }
    return acc;
  }, {});
}
