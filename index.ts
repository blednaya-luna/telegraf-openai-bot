import { config } from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

config();

const telegramBotToken = process.env.TELEGRAMM_BOT_TOKEN;

if (!telegramBotToken) {
  throw new Error(
    'Telegram bot token is missing. Please set the TELEGRAMM_BOT_TOKEN environment variable.',
  );
}

const openAIApiKey = process.env.OPENAI_API_KEY;

if (!openAIApiKey) {
  throw new Error(
    'OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.',
  );
}

const telegramBot = new Telegraf(telegramBotToken);

const openAIConfig = new Configuration({
  apiKey: openAIApiKey,
});

const openAIApiInstance = new OpenAIApi(openAIConfig);

telegramBot.on(message('text'), async (ctx) => {
  const response = await openAIApiInstance.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: ctx.message.text }],
  });

  if (response.data.choices[0].message?.content) {
    ctx.reply(response.data.choices[0].message.content, {
      reply_to_message_id: ctx.message.message_id,
    });
  } else {
    ctx.reply("I'm sorry, I couldn't generate a response.", {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});

telegramBot.launch();

process.once('SIGINT', () => telegramBot.stop('SIGINT'));
process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));
