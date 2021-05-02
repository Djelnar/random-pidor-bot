//@ts-check
const TelegramBot = require('node-telegram-bot-api')
const { Mamkoeb } = require('./mamkoeb')

const mamkoeb = new Mamkoeb()
/**
 *
 * @param text {string}
 * @param msg {TelegramBot.Message}
 * @param commandMsg {TelegramBot.Message}
 * @returns {Promise<string>}
 */
const macros = async (text, msg, commandMsg) => {
  const mfc = await mamkoeb.getMfc()

  return text
    .replace(/%mfc%/g, mfc)
    .replace(/%unm%/g, msg?.from?.username)
    .replace(/%mun%/g, commandMsg?.from?.username)
    .replace(/%dym%/g, 'ты хотел сказать: ')
    .replace(/%fnm%/g, msg?.from?.first_name)
    .replace(/%mfn%/g, commandMsg?.from?.first_name)
}

module.exports = {
  macros,
}
