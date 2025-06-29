/**
 * Unified response handler for Express.
 *
 * @param {Object} res - Express response object.
 * @param {Object} options - Options for the response.
 * @param {boolean} [options.success=true] - Whether the response is a success.
 * @param {number} [options.statusCode=200] - HTTP status code.
 * @param {string} [options.message=""] - Response message.
 * @param {any} [options.data=null] - Response data.
 * @param {any} [options.error=null] - Error details if any.
 * @param {Object} [options.pagination] - Pagination details if paginated.
 * @param {number} options.pagination.pageNumber - Current page number.
 * @param {number} options.pagination.totalPages - Total number of pages.
 * @param {number} options.pagination.totalItems - Total number of items.
 * @returns {Response} - Express response.
 */
const sendResponse = (
  res,
  {
    success = true,
    statusCode = success ? 200 : 500,
    message = success ? 'Success' : 'Error',
    data = null,
    error = null,
    pagination = null,
  } = {}
) => {
  const response = {
    success,
    message,
  };

  if (success) {
    response.data = data;
    if (pagination) {
      response.pagination = {
        pageNumber: pagination.pageNumber,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
      };
    }
  } else {
    response.error = error || message;
  }

  return res.status(statusCode).json(response);
};
export default sendResponse;
