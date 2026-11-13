import React, { useState } from 'react';
import { useForumMessages } from './hooks/useForumMessages';
import './App.css';

const channels = ['general', 'technology', 'design'];

function App() {
  const [channelId, setChannelId] = useState('general');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { msgs, loading, error, refresh } =
    useForumMessages(channelId);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    if (!author.trim() || !content.trim()) {
      setSubmitError('Please enter your name and message.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/channels/${channelId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            author: author.trim(),
            content: content.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send message.');
      }

      setAuthor('');
      setContent('');
      refresh();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="forum">
      <header className="forum-header">
        <h1>Community Forum</h1>
        <p>Share your ideas with the community.</p>
      </header>

      <section className="channel-section">
        <label htmlFor="channel">Select a channel</label>

        <select
          id="channel"
          value={channelId}
          onChange={(event) => setChannelId(event.target.value)}
        >
          {channels.map((channel) => (
            <option key={channel} value={channel}>
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </option>
          ))}
        </select>
      </section>

      <section className="messages-section">
        <h2>Messages</h2>

        {loading && <p role="status">Loading messages...</p>}

        {error && <p className="error-message" role="alert">{error}</p>}

        {!loading && !error && msgs.length === 0 && (
          <p>No messages yet.</p>
        )}

        {!loading && !error && msgs.length > 0 && (
          <dl className="message-list">
            {msgs.map((msg) => (
              <React.Fragment key={msg.id}>
                <dt>{msg.author}</dt>
                <dd>{msg.content}</dd>
              </React.Fragment>
            ))}
          </dl>
        )}
      </section>

      <section className="message-form-section">
        <h2>Post a message</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="author">Your name</label>
          <input
            id="author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            maxLength={50}
            required
          />

          <label htmlFor="content">Message</label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={500}
            required
            rows={4}
          />

          {submitError && (
            <p className="error-message" role="alert">
              {submitError}
            </p>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
