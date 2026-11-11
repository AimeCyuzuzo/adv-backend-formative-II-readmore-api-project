const express = require('express');
const {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
} = require('../controllers/book.controllers');

const router = express.Router();

router.route('/')
    .post(createBook)
    .get(getAllBooks);

router.route('/:id')
    .get(getBookById)
    .put(updateBook)
    .delete(deleteBook);

module.exports = router;
