const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

/**
 * Authentication middleware
 * Verifies the JWT token and attaches the user to the request object
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports = async (req, res, next) => {
	try {
		// Extract the token from the Authorization header
		const token = req.header('Authorization').replace('Bearer ', '');

		// Verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Find the user associated with the token
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			include: { tokens: { where: { token } } },
		});

		// If user not found or token not in the user's tokens, throw an error
		if (!user || user.tokens.length === 0) {
			throw new Error('User not found or token invalid');
		}

		// Attach the token and user to the request object
		req.token = token;
		req.user = user;

		next();
	} catch (error) {
		console.error('Authentication error:', error.message);
		res.status(401).send({ error: 'Please authenticate.' });
	}
};

