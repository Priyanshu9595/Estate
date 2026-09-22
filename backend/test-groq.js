require('dotenv').config();
const Groq = require('groq-sdk');

async function main() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello' }],
      model: 'qwen/qwen3.8-27b',
    });
    console.log(chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
main();
