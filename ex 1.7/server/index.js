
const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');

const app = express();
const PORT = 5000;

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// Limit JSON payload size
app.use(express.json({ limit: '10kb' }));

// Sample forum messages
const messages = {
  general: [
    {
      id: '1',
      author: 'Alice',
      content: 'Welcome to the general channel!',
    },
    {
      id: '2',
      author: 'Bob',
      content: 'Hello everyone!',
    },
  ],
  technology: [
    {
      id: '3',
      author: 'Charlie',
      content: 'What is your favorite JavaScript framework?',
    },
  ],
  design: [
    {
      id: '4',
      author: 'Diana',
      content: 'Let us share some UI design ideas.',
    },
  ],
};

// GET messages by channel
app.get('/api/channels/:channelId/messages', (req, res) => {
  const { channelId } = req.params;

  if (!Object.hasOwn(messages, channelId)) {
    return res.status(404).json({
      error: 'Channel not found',
    });
  }

  return res.json(messages[channelId]);
});

// POST a new message
app.post('/api/channels/:channelId/messages', (req, res) => {
  const { channelId } = req.params;
  const { author, content } = req.body || {};

  if (!Object.hasOwn(messages, channelId)) {
    return res.status(404).json({
      error: 'Channel not found',
    });
  }

  // Strict payload validation
  if (
    typeof author !== 'string' ||
    typeof content !== 'string' ||
    !author.trim() ||
    !content.trim() ||
    author.trim().length > 50 ||
    content.trim().length > 500
  ) {
    return res.status(400).json({
      error: 'Invalid payload. Author must be 1-50 characters and content must be 1-500 characters.',
    });
  }

  const newMessage = {
    id: randomUUID(),
    author: author.trim(),
    content: content.trim(),
  };

  messages[channelId].push(newMessage);

  return res.status(201).json(newMessage);
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON payload',
    });
  }

  console.error(err);
  return res.status(500).json({
    error: 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Forum API running at http://localhost:${PORT}`);
});
