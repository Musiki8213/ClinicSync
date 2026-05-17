export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id or value' });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate field value' });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
}
