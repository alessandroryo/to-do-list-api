const prisma = require('../config/database');

/**
 * Create a new tag
 * @route POST /api/tags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createTag = async (req, res) => {
	console.log('[createTag] Attempting to create tag:', req.body);
	try {
		const { name } = req.body;

		// Validate input
		if (!name) {
			return res.status(400).json({ error: 'Tag name is required' });
		}

		// Create tag in database
		const tag = await prisma.tag.create({ data: { name } });
		console.log('[createTag] Tag created successfully:', tag.id);

		// Send successful response
		res.status(201).json(tag);
	} catch (error) {
		console.error('[createTag] Error:', error);
		res.status(500).json({ error: 'Error creating tag', details: error.message });
	}
};

/**
 * Retrieve all tags
 * @route GET /api/tags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTags = async (req, res) => {
	console.log('[getAllTags] Fetching all tags');
	try {
		// Fetch all tags from database
		const tags = await prisma.tag.findMany();
		console.log(`[getAllTags] Found ${tags.length} tags`);

		// Send successful response
		res.json(tags);
	} catch (error) {
		console.error('[getAllTags] Error:', error);
		res.status(500).json({ error: 'Error fetching tags', details: error.message });
	}
};
