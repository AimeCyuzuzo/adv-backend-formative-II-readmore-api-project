const mongoose = require('mongoose');
const Author = require('../models/author.models');
const Book = require('../models/book.models');

const notFound = (res, id) =>
    res.status(404).json({ message: `No author found with id ${id}` });

// Turns Mongoose validation errors into a 400; anything else is a 500.
const handleError = (res, error) => {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Invalid author data', errors: error.errors });
    }
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
};

// POST /authors
const createAuthor = async (req, res) => {
    try {
        const { name, country, bio } = req.body;
        const author = await Author.create({ name, country, bio });
        res.status(201).json(author);
    } catch (error) {
        handleError(res, error);
    }
};

// GET /authors
const getAllAuthors = async (req, res) => {
    try {
        const authors = await Author.find().sort({ createdAt: -1 });
        res.status(200).json(authors);
    } catch (error) {
        handleError(res, error);
    }
};

// GET /authors/:id
const getAuthorById = async (req, res) => {
    const { id } = req.params;
    // A malformed id can't match any author, so treat it as not found.
    if (!mongoose.isValidObjectId(id)) return notFound(res, id);

    try {
        const author = await Author.findById(id);
        if (!author) return notFound(res, id);
        res.status(200).json(author);
    } catch (error) {
        handleError(res, error);
    }
};

// PUT /authors/:id
const updateAuthor = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return notFound(res, id);

    try {
        const { name, country, bio } = req.body;
        const author = await Author.findByIdAndUpdate(
            id,
            { name, country, bio },
            { new: true, runValidators: true }
        );
        if (!author) return notFound(res, id);
        res.status(200).json(author);
    } catch (error) {
        handleError(res, error);
    }
};

// DELETE /authors/:id
const deleteAuthor = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return notFound(res, id);

    try {
        const author = await Author.findById(id);
        if (!author) return notFound(res, id);

        const bookCount = await Book.countDocuments({ author: id });
        if (bookCount > 0) {
            return res.status(409).json({
                message: `Cannot delete ${author.name}: they still have ${bookCount} book(s). Delete or reassign their books first, e.g. with DELETE /authors/${id}/books.`,
                bookCount,
            });
        }

        await Author.findByIdAndDelete(id);
        res.status(200).json({ message: 'Author deleted successfully', author });
    } catch (error) {
        handleError(res, error);
    }
};

// GET /authors/:id/books
const getAuthorBooks = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return notFound(res, id);

    try {
        const author = await Author.findById(id);
        if (!author) return notFound(res, id);

        const books = await Book.find({ author: id }).sort({ publishedYear: 1 });
        res.status(200).json({ author, count: books.length, books });
    } catch (error) {
        handleError(res, error);
    }
};

// DELETE /authors/:id/books
const deleteAuthorBooks = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return notFound(res, id);

    try {
        const author = await Author.findById(id);
        if (!author) return notFound(res, id);

        const { deletedCount } = await Book.deleteMany({ author: id });
        res.status(200).json({
            message: `Deleted ${deletedCount} book(s) by ${author.name}`,
            deletedCount,
        });
    } catch (error) {
        handleError(res, error);
    }
};

module.exports = {
    createAuthor,
    getAllAuthors,
    getAuthorById,
    updateAuthor,
    deleteAuthor,
    getAuthorBooks,
    deleteAuthorBooks,
};
