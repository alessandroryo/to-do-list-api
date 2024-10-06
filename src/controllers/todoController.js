const prisma = require('../config/database');

/**
 * Get all todos for the authenticated user
 * @route GET /api/todos
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTodos = async (req, res) => {
	console.log(`[getAllTodos] Fetching todos for user: ${req.user.id}`);
	try {
		const todos = await prisma.todo.findMany({
			where: { userId: req.user.id },
			include: { tags: { include: { tag: true } } },
		});
		console.log(`[getAllTodos] Found ${todos.length} todos`);
		res.json(todos);
	} catch (error) {
		console.error('[getAllTodos] Error:', error);
		res.status(500).json({ error: 'Error fetching todos' });
	}
};

/**
 * Create a new todo for the authenticated user
 * @route POST /api/todos
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createTodo = async (req, res) => {
	console.log('[createTodo] Attempting to create todo:', req.body);
	try {
		const { title, description, dueDate, tags } = req.body;

		// Basic input validation
		if (!title) {
			return res.status(400).json({ error: 'Title is required' });
		}

		// Prepare todo data
		let todoData = {
			title,
			description,
			dueDate: dueDate ? new Date(dueDate) : undefined,
			userId: req.user.id,
		};

		// If tags are provided, verify their existence
		if (tags && tags.length > 0) {
			const existingTags = await prisma.tag.findMany({
				where: {
					id: { in: tags },
				},
			});

			console.log(`[createTodo] Found ${existingTags.length} existing tags`);

			if (existingTags.length !== tags.length) {
				return res.status(400).json({ error: 'One or more tags do not exist' });
			}

			todoData.tags = {
				create: tags.map(tagId => ({ tag: { connect: { id: tagId } } })),
			};
		}

		// Create todo
		const todo = await prisma.todo.create({
			data: todoData,
			include: { tags: { include: { tag: true } } },
		});

		console.log('[createTodo] Todo created successfully:', todo.id);
		res.status(201).json(todo);
	} catch (error) {
		console.error('[createTodo] Error:', error);
		res.status(500).json({ error: 'Error creating todo', details: error.message });
	}
};

/**
 * Get a specific todo by ID for the authenticated user
 * @route GET /api/todos/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTodoById = async (req, res) => {
	const { id } = req.params;
	console.log(`[getTodoById] Fetching todo with id: ${id} for user: ${req.user.id}`);
	try {
		const todo = await prisma.todo.findUnique({
			where: { id: Number(id), userId: req.user.id },
			include: { tags: { include: { tag: true } } },
		});
		if (todo) {
			console.log('[getTodoById] Todo found');
			res.json(todo);
		} else {
			console.log('[getTodoById] Todo not found');
			res.status(404).json({ error: 'Todo not found' });
		}
	} catch (error) {
		console.error('[getTodoById] Error:', error);
		res.status(500).json({ error: 'Error fetching todo' });
	}
};

/**
 * Update a specific todo by ID for the authenticated user
 * @route PUT /api/todos/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTodo = async (req, res) => {
	const { id } = req.params;
	console.log(`[updateTodo] Updating todo with id: ${id}`, req.body);
	try {
		const { title, description, isCompleted, dueDate, tags } = req.body;
		const todo = await prisma.todo.update({
			where: { id: Number(id), userId: req.user.id },
			data: {
				title,
				description,
				isCompleted,
				dueDate,
				tags: {
					deleteMany: {},
					create: tags?.map(tagId => ({ tag: { connect: { id: tagId } } })) || [],
				},
			},
			include: { tags: { include: { tag: true } } },
		});
		console.log('[updateTodo] Todo updated successfully');
		res.json(todo);
	} catch (error) {
		console.error('[updateTodo] Error:', error);
		res.status(500).json({ error: 'Error updating todo', details: error.message });
	}
};

/**
 * Delete a specific todo by ID for the authenticated user
 * @route DELETE /api/todos/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteTodo = async (req, res) => {
	const { id } = req.params;
	console.log(`[deleteTodo] Deleting todo with id: ${id} for user: ${req.user.id}`);
	try {
		await prisma.todo.delete({
			where: { id: Number(id), userId: req.user.id },
		});
		console.log('[deleteTodo] Todo deleted successfully');
		res.status(204).send();
	} catch (error) {
		console.error('[deleteTodo] Error:', error);
		res.status(500).json({ error: 'Error deleting todo', details: error.message });
	}
};
