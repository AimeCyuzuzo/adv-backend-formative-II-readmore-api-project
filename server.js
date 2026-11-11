require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const authorRoutes = require('./routes/author.routes');
const bookRoutes = require('./routes/book.routes');
const requestLogger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(requestLogger);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API is running',
  });
});

app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);


async function startServer() {
  if (!MONGODB_URI) {
    console.error('Please set the MONGODB_URI environment variable in your .env file');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();