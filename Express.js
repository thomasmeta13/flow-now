const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: req.body.message }],
      temperature: 0.7, // Adjust for desired creativity/randomness
      max_tokens: 1000 // Adjust based on expected response length
    }, {
      headers: {
        'Authorization': `Bearer API_KEY`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ message: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));