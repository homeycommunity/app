/**
 * Async version of `setTimeout`.
 * @param {number} timeout - milliseconds
 * @returns {Promise<unknown>}
 * @memberof Util
 */
export async function wait(timeout: number) {
  if (typeof timeout !== "number") {
    throw new TypeError("expected_timeout_number");
  }
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
