const mongoose = require('mongoose');
const Book = require('../models/book.models');
const Author = require('../models/author.models');

const notFound = (res, id) =>
    res.status(404).json({ message: `No book found with id ${id}` });

// Turns Mongoose validation/cast errors into a 400; anything else is a 500.
const handleError = (res, error) => {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid book data', errors: error.errors || error.message });
    }
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
};

// `required` on the schema only checks that *some* value is present, so we
// look the author up ourselves to make sure the id points at a real author.
const authorExists = async (authorId) =>
    mongoose.isValidObjectId(authorId) && (await Author.exists({ _id: authorId })) !== null;

const isDuplicateTitle = (title, author, excludeId) => {
    const filter = { author, title: String(title).trim() };
    if (excludeId) filter._id = { $ne: excludeId };
    return Book.exists(filter).collation({ locale: 'en', strength: 2 });
};

const duplicateTitle = (res, title) =>
    res.status(409).json({ message: `This author already has a book titled "${String(title).trim()}"` });

// POST /books
const createBook = async (req, res) => {
    try {
        const { title, genre, price, publishedYear, author } = req.body;

        if (!(await authorExists(author))) {
            return res.status(400).json({ message: `No author found with id ${author}` });
        }

        if (typeof title === 'string' && (await isDuplicateTitle(title, author))) {
            return duplicateTitle(res, title);
        }

        const book = await Book.create({ title, genre, price, publishedYear, author });
        await book.populate('author');
        res.status(201).json(book);
    } catch (error) {
        handleError(res, error);
    }
};

// GET /books
const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find().populate('author').sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        handleError(res, error);
    }
};

// GET /books/:id
const getBookById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return notFound(res, id);

    try {
        const book = await Book.findById(id).populate('author');
        if (!book) return notFound(res, id);
        res.status(200).json(book);
    } catch (error) {
        handleError(res, error);
    }
};

// PUT /books/:id
const updateBook = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return notFound(res, id);

    try {
        const { title, genre, price, publishedYear, author } = req.body;

        const existing = await Book.findById(id);
        if (!existing) return notFound(res, id);

        // Only check the author if the client is trying to change it.
        if (author !== undefined && !(await authorExists(author))) {
            return res.status(400).json({ message: `No author found with id ${author}` });
        }

        if (title !== undefined || author !== undefined) {
            const finalTitle = title ?? existing.title;
            const finalAuthor = author ?? existing.author;
            if (await isDuplicateTitle(finalTitle, finalAuthor, id)) {
                return duplicateTitle(res, finalTitle);
            }
        }

        const book = await Book.findByIdAndUpdate(
            id,
            { title, genre, price, publishedYear, author },
            { new: true, runValidators: true }
        ).populate('author');
        if (!book) return notFound(res, id);
        res.status(200).json(book);
    } catch (error) {
        handleError(res, error);
    }
};

// DELETE /books/:id
const deleteBook = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return notFound(res, id);

    try {
        const book = await Book.findByIdAndDelete(id);
        if (!book) return notFound(res, id);
        res.status(200).json({ message: 'Book deleted successfully', book });
    } catch (error) {
        handleError(res, error);
    }
};

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
};
