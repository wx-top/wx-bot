import { Bot } from './bot.js';
import { AiInquiryCommandHandler } from './handlers/commands/AiInquiryCommandHandler.js';
import { ClearCommandHandler } from './handlers/commands/ClearCommandHandler.js';
import { PromptCommandHandler } from './handlers/commands/PromptCommandHandler.js';
import { HelpCommandHandler } from './handlers/commands/HelpCommandHandler.js';

const bot = new Bot()
bot.registerHandler(new AiInquiryCommandHandler())
bot.registerHandler(new PromptCommandHandler())
bot.registerHandler(new ClearCommandHandler())
bot.registerHandler(new HelpCommandHandler())
bot.start()




