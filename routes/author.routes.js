const express = require('express');
const {
    createAuthor,
    getAllAuthors,
    getAuthorById,
    updateAuthor,
    deleteAuthor,
    getAuthorBooks,
    deleteAuthorBooks,
    getAuthorStats,
} = require('../controllers/author.controllers');

const router = express.Router();

router.route('/')
    .post(createAuthor)
    .get(getAllAuthors);

router.route('/:id')
    .get(getAuthorById)
    .put(updateAuthor)
    .delete(deleteAuthor);

router.route('/:id/books')
    .get(getAuthorBooks)
    .delete(deleteAuthorBooks);

router.get('/:id/stats', getAuthorStats);

module.exports = router;
