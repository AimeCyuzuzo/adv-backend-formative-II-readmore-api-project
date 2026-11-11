const express = require('express');
const {
    createAuthor,
    getAllAuthors,
    getAuthorById,
    updateAuthor,
    deleteAuthor,
    getAuthorBooks,
} = require('../controllers/author.controllers');

const router = express.Router();

router.route('/')
    .post(createAuthor)
    .get(getAllAuthors);

router.route('/:id')
    .get(getAuthorById)
    .put(updateAuthor)
    .delete(deleteAuthor);

router.get('/:id/books', getAuthorBooks);

module.exports = router;
