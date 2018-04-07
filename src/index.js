const axios = require('axios')
const { bot } = require('./config.js')
require('./events')

const PRICE_BASE_URL = 'https://api.coinmarketcap.com'

bot.onText(/\/start|\/help/, (message, match) => {
  const chatId = message.chat.id
  const command = match[0]

  let reply = ''

  if (command === '/help') {
    reply += `Hello ${message.from.first_name}, I see you are having some trouble with me. Do not worry, I am here to help!\n\n`
  } else {
    reply += `Hello ${message.from.first_name} and thank you for using me! This will get you started.\n\n`
  }

  reply += 'You can control me with the follow commands:\n\n'
  reply += '*Events*\n'
  reply += '/events - Display 3 of the latest events\n'
  reply += '/event <symbol> - Display event(s) for the particular coin\n\n'
  reply += '*Prices*\n'
  reply += '/price <coin> - Display the price for the particular coin\n'
  reply += '/mcap - Display the total market capitalisation and Bitcoin dominance\n\n'
  reply += 'As always, you are welcome to use the /help command to bring this page up again at anytime within the bot\'s chat.\n\n'

  bot.sendMessage(chatId, reply, { parse_mode: 'markdown' })
})

bot.onText(/\/mcap/, async message => {
  const chatId = message.chat.id

  await axios.get(`${PRICE_BASE_URL}/v1/global`).then(response => {
    const data = response.data

    const marketCap = `_$${parseFloat(data.total_market_cap_usd).toLocaleString('en')}_`
    const bitcoinDominace = `_${parseFloat(data.bitcoin_percentage_of_market_cap).toFixed(2)}%_`

    const reply = `*Total Market Cap:* ${marketCap}\n*Bitcoin Dominance:* ${bitcoinDominace}`

    bot.sendMessage(chatId, reply, { parse_mode: 'markdown' }).then(() => console.log('Total Market Cap in USD'))
  })
})

bot.onText(/\/price (.+)/, async (message, match) => {
  const chatId = message.chat.id
  const inputSymbol = match[1]

  let coinList

  await axios.get(`${PRICE_BASE_URL}/v1/ticker/?limit=0`).then(response => {
    coinList = response.data
  })

  const coinDetail = coinList.filter(item => item.symbol === inputSymbol.toUpperCase())[0]

  const rank = `*Rank:* _${coinDetail.rank}_`
  const mCap = `*Est. Market Cap (USD):* _$${parseFloat(coinDetail.market_cap_usd).toLocaleString('en')}_`
  const priceUSD = `*USD:* _$${parseFloat(coinDetail.price_usd)}_`
  const priceBTC = `*BTC:* _${parseFloat(coinDetail.price_btc).toFixed(8)} BTC_`
  const priceDelta = `*24hr Change:* _${parseFloat(coinDetail.percent_change_24h)}%_`

  const reply = `Price for *${coinDetail.name} (${coinDetail.symbol})*:\n\n${rank}\n${mCap}\n${priceUSD}\n${priceBTC}\n${priceDelta}`

  bot.sendMessage(chatId, reply, { parse_mode: 'markdown' }).then(() => console.log(`Found price for ${inputSymbol}`))
})
