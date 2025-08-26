// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const axios = require('axios');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/chat', async (req, res) => {
  try {
    const userMessage = String(req.body.message || '').trim();
    if (!userMessage) return res.status(400).json({ error: 'Missing message' });

    // Lyrics search
    if (/^lyrics[:\-]/i.test(userMessage)) {
      const query = userMessage.replace(/^lyrics[:\-]\s*/i, '');
      let [song, artist] = query.split(' by ');
      song = song ? song.trim() : '';
      artist = artist ? artist.trim() : '';
      if (!song || !artist) {
        return res.json({ reply: "Please use the format: lyrics: [song] by [artist]" });
      }
      try {
        const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
        if (response.data && response.data.lyrics) {
          return res.json({ reply: response.data.lyrics });
        } else {
          return res.json({ reply: "Lyrics not found." });
        }
      } catch (err) {
        return res.json({ reply: "Lyrics not found or error occurred." });
      }
    }

    // Image generation
    if (/^(draw|image)[:\-]/i.test(userMessage)) {
      const prompt = userMessage.replace(/^(draw|image)[:\-]\s*/i, '');
      const image = await client.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "512x512"
      });
      const imageUrl = image.data[0].url;
      return res.json({ image: imageUrl });
    }

    // Smarter web search trigger
    const searchTriggers = [
      /^search[:\-]\s*/i,
      /^tell me about\s+/i,
      /^explain\s+/i,
      /^what is\s+/i,
      /^who is\s+/i,
      /^define\s+/i,
      /^give me info on\s+/i,
      /^info on\s+/i,
      /^summarize\s+/i
    ];
    const matched = searchTriggers.find(rx => rx.test(userMessage));
    if (matched) {
      // Extract the query
      let query = userMessage.replace(matched, '').trim();
      if (!query) query = userMessage; // fallback

      // Do the web search
      try {
        const serpRes = await axios.get('https://serpapi.com/search', {
          params: {
            q: query,
            api_key: process.env.SERPAPI_KEY,
            gl: 'us',
            hl: 'en'
          }
        });
        const results = serpRes.data.organic_results || [];
        const news = serpRes.data.news_results || [];
        const answerBox = serpRes.data.answer_box;

        // Compose a summary
        let summary = `**${query.charAt(0).toUpperCase() + query.slice(1)} — Quick Overview**\n`;

        // Add answer box if present
        if (answerBox && answerBox.answer) {
          summary += `\n${answerBox.answer}\n`;
        } else if (answerBox && answerBox.snippet) {
          summary += `\n${answerBox.snippet}\n`;
        }

        // Add top 2-3 organic results
        if (results.length) {
          summary += `\n**Key Points:**\n`;
          results.slice(0, 3).forEach((r, i) => {
            summary += `- **${r.title}**: ${r.snippet || ''}\n  [${r.link}](${r.link})\n`;
          });
        }

        // Add news if available
        if (news.length) {
          summary += `\n**Recent News:**\n`;
          news.slice(0, 2).forEach(n =>
            summary += `- ${n.title} (${n.date})\n  [${n.link}](${n.link})\n`
          );
        }

        // Add a recap
        summary += `\n*For more details, ask for recipes, history, health info, or related topics!*`;

        return res.json({ reply: summary });
      } catch (err) {
        return res.json({ reply: "Web search failed or quota exceeded." });
      }
    }

    // Chat completion (fallback)
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || '';
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
