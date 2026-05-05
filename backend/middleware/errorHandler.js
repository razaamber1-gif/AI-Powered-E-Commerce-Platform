/**
 * Express error handler. Mounted last so any thrown / next(err) lands here.
 * Returns a clean JSON shape so the frontend can consistently handle errors.
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err.message);

  // Mongoose duplicate key (e.g. email already used)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `${field} already in use`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Server error',
  });
};

module.exports = errorHandler;
