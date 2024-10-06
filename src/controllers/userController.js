const prisma = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Register a new user
 * @route POST /api/users/register
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user in the database
		const user = await prisma.user.create({
			data: {
				username,
				email,
				passwordHash: hashedPassword,
			},
		});

		res.status(201).json({ message: 'User created successfully', userId: user.id });
	} catch (error) {
		console.error('[register] Error:', error);
		res.status(500).json({ error: 'Error registering user', details: error.message });
	}
};

/**
 * Login user
 * @route POST /api/users/login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user by email
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, user.passwordHash);
		if (!isValidPassword) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Generate JWT token
		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

		// Save token to database
		await prisma.token.create({
			data: {
				token,
				userId: user.id,
				expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
			},
		});

		res.json({ token });
	} catch (error) {
		console.error('[login] Error:', error);
		res.status(500).json({ error: 'Error logging in', details: error.message });
	}
};

/**
 * Logout user
 * @route POST /api/users/logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logout = async (req, res) => {
	try {
		// Delete token from database
		await prisma.token.delete({ where: { token: req.token } });
		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error('[logout] Error:', error);
		res.status(500).json({ error: 'Error logging out', details: error.message });
	}
};
