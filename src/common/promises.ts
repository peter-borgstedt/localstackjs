/**
 * Chunkify an array into several of a given size.
 *
 * E.g. [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] will become:
 * [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10]]
 *
 * @param array The array to be divided
 * @param chunkSize The maximum chunk size
 */
export const chunkify = <T>(array: T[], limit): T[][] => {
  const chunks: T[][] = [];
  const length = array.length;
  for (let i = 0; i < length;  i += limit) {
    chunks.push(array.slice(i, i + limit));
  }
  return chunks;
};

export const promiseConcurrent = async <T>(arr: Promise<T>[], limit = 25): Promise<PromiseSettledResult<T>[]> => {
  const chunks: Promise<T>[][] = chunkify(arr, limit);
  const resolved: PromiseSettledResult<T>[] = [];
  for (const chunk of chunks) {
    resolved.push(... await Promise.allSettled(chunk));
  }
  return resolved;
};
