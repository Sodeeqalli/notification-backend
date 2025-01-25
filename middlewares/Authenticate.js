const jwt = require('jsonwebtoken');


const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Received token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Map id to _id for consistency
    req.user = { _id: decoded.id, ...decoded };

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authenticate;


