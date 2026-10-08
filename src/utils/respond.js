exports.ok = (res, message, data, status = 200, pagination) => {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(status).json(body);
};
