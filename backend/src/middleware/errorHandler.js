export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload size exceeds server limit.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
