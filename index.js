//@ts-check
const TelegramBot = require('node-telegram-bot-api')
const { promisify } = require('util')
const { Mamkoeb } = require('./mamkoeb')
const { trimSlashes } = require('./trim-slashes')
const { splitBySlash } = require('./split-by-slash')
const { macros } = require('./macros')

const sleep = promisify(setTimeout)

const token = process.env.TOKEN

const bot = new TelegramBot(token, { polling: true })

bot.onText(/^[-]?y\/.+/, async (msg) => {
  const { chat } = msg
  let command = msg.text

  if (command.startsWith('-')) {
    command = command.replace(/^\-/, '')

    await bot.deleteMessage(msg.chat.id, msg.message_id)

    await sleep(300)
  }

  command = command.replace(/^y\/+/, '').replace(/\/+/g, '/')

  const [match, replacement, flags] = splitBySlash(command)

  const re = new RegExp(match, flags)

  let prevMsg = msg?.reply_to_message

  if (!prevMsg) {
    return
  }

  let textToProcess = prevMsg?.text || prevMsg?.caption || ''

  const replaced = textToProcess.replace(re, replacement)

  const macrosed = await macros(replaced, prevMsg, msg)

  if (!textToProcess || !replaced || !macrosed) {
    console.log(msg, 'msg msg msg')
    console.log(prevMsg, 'prevMsg prevMsg prevMsg')
    console.log(macrosed, 'macrosed macrosed macrosed')
  }

  if (msg.photo && msg.photo.length > 0) {
    return bot.sendMediaGroup(
      chat.id,
      msg.photo.map((p) => ({
        type: 'photo',
        media: p.file_id,
        caption: macrosed,
      })),
      {
        reply_to_message_id: prevMsg.message_id,
        allow_sending_without_reply: true,
      },
    )
  }

  return bot.sendMessage(chat.id, macrosed, {
    reply_to_message_id: prevMsg.message_id,
    allow_sending_without_reply: true,
  })
})
