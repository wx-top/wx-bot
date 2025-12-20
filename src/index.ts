import { Bot } from './bot.js';
import { AiInquiryCommandHandler } from './handlers/commands/AiInquiryCommandHandler.js';

const bot = new Bot()
bot.registerHandler(new AiInquiryCommandHandler())
bot.start()




