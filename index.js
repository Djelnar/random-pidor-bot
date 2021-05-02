//@ts-check
const TelegramBot = require('node-telegram-bot-api')
const Redis = require('ioredis')
const { promisify } = require('util')
const { Mamkoeb } = require('./mamkoeb')
const { trimSlashes } = require('./trim-slashes')
const { splitBySlash } = require('./split-by-slash')
const { macros } = require('./macros')

const sleep = promisify(setTimeout)

const token = process.env.TOKEN

const bot = new TelegramBot(token, { polling: true })

const redis = new Redis() // uses defaults unless given configuration object

bot.onText(/.*/, async (msg) => {
  await redis.hset(msg.chat.id, msg.message_id, JSON.stringify(msg))
})

const getPrevMessageRec = async (chatId, id, count = 0) => {
  if (id < 0 || count > 50) {
    return null
  }

  const msg = await redis.hget(chatId, id)

  if (!msg) {
    return getPrevMessageRec(chatId, id - 1, count + 1)
  } else {
    const parsedMsg = JSON.parse(msg)

    if (/^[+]?[-]?\w\/.+/.test(parsedMsg.text)) {
      return getPrevMessageRec(chatId, id - 1, count + 1)
    }

    return parsedMsg
  }
}

bot.onText(/^[+]?[-]?y\/.+/, async (msg) => {
  const { chat } = msg
  let command = msg.text

  let isReplyToReply = false

  if (command.startsWith('+')) {
    command = command.replace(/^\+/, '')
    isReplyToReply = true
  }

  if (command.startsWith('-')) {
    command = command.replace(/^\-/, '')

    await bot.deleteMessage(msg.chat.id, msg.message_id)

    await sleep(1000)
  }

  command = command.replace(/^y\/+/, '').replace(/\/+/g, '/')

  const [match, replacement, flags] = splitBySlash(command)

  const re = new RegExp(match, flags)

  let prevMsg = msg?.reply_to_message

  let textToProcess = prevMsg?.text || prevMsg?.caption || ''

  if (!prevMsg) {
    prevMsg = await getPrevMessageRec(msg.chat.id, msg.message_id - 1)
    if (!prevMsg) {
      return
    }

    textToProcess = prevMsg?.text || prevMsg?.caption || ''
  }

  if (isReplyToReply) {
    let savedPrevId = prevMsg.message_id - 1

    prevMsg = prevMsg?.reply_to_message

    if (!prevMsg) {
      prevMsg = await getPrevMessageRec(msg.chat.id, savedPrevId)

      if (!prevMsg) {
        return
      }
    }

    textToProcess = prevMsg?.text || prevMsg?.caption || ''
  }

  const replaced = textToProcess.replace(re, replacement)

  const macrosed = await macros(replaced, prevMsg, msg)

  await bot.sendMessage(chat.id, macrosed, {
    reply_to_message_id: prevMsg.message_id,
  })
})
