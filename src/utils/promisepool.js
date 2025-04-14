function chunkPromises(promises, batchSize) {
  const batches = [];
  for (let i = 0; i < promises.length; i += batchSize) {
    batches.push(promises.slice(i, i + batchSize));
  }
  return batches;
}
export function chunkArray(array, batchSize) {
  const result = [];
  for (let i = 0; i < array.length; i += batchSize) {
    result.push(array.slice(i, i + batchSize));
  }
  return result;
}
// Main function to process requests in a promise pool
export async function promisePool(promises, batchSize = 20) {
  const batches = chunkPromises(promises, batchSize);
  let results = [];

  for (const batch of batches) {
    // Wait for all promises in this batch to complete
    const batchResults = await Promise.all(batch);
    results = results.concat(batchResults); // Add the batch results to the main result array
  }

  return results;
}
export async function processPromisesBatch(items, limit, fn) {
  let results = [];
  for (let start = 0; start < items.length; start += limit) {
    const end = start + limit > items.length ? items.length : start + limit;

    const slicedResults = await Promise.all(items.slice(start, end).map(fn));

    results = [...results, ...slicedResults];
  }

  return results;
}
