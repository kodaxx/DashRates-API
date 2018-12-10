const express = require('express')
const app = express()
const axios = require('axios')
// cache ttl seconds based on server response (xxx is default)
const cache = require('express-redis-cache')({ expire: { 200: 60, 404: 1, xxx: 1 } })
const get = require('./get')
const list = require('./list')

// log cache messages to console
cache.on('message', function(message){
  console.log("cache", message);
});

// log cache errors to console
cache.on('error', function(error){
  console.error("cache", error);
});

// prettify json
app.set('json spaces', 2)

// ignore favicon
app.use(function(req, res, next) {
  if (req.originalUrl === '/favicon.ico') {
    res.status(204).json({
      nope: true
    })
  } else {
    next()
  }
})

// access control allow headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use('/static', express.static(__dirname + '/public'))

// docs at '/'
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/docs/index.html')
})

// verification token for loader.io testing - this is not necessary if running your own instance
app.get('/loaderio-5c8ed429de43ac44e439a90752086c1d', function(req, res) {
  res.sendFile(__dirname + '/public/loaderio-5c8ed429de43ac44e439a90752086c1d.txt')
})

const fiat2btcUrl = 'https://apiv2.bitcoinaverage.com/indices/global/ticker/short?crypto=BTC'
const btc2dashAverageUrl = 'https://min-api.cryptocompare.com/data/generateAvg?fsym=DASH&tsym=BTC&e=Binance,Kraken,Poloniex,Bitfinex'
const vesUrl = 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=VES'

// returns dash's average dash/btc price
app.get('/avg', cache.route(), async function (req, res) {
  try {
    let dash = await get.dashAverage(btc2dashAverageUrl)
    res.json(dash)
  }
  catch(error) {
    res.status(404).json(error)
  }
})

// returns cointext invoice number
app.get('/invoice', async function(req, res) {
  const address = req.query.addr
  const amount = parseInt(req.query.amount)
  res.json(await providers.invoice(address, amount))
})

// this is the main endpoint, used for grabbing a list of all currencies, or specific ones
app.get('/*', cache.route(), async function(req, res) {
  const params = req.params[0].split('/')
  let currencies = params.map(currency => currency.toUpperCase())
  // if we want all rates, we simply pass the 'list' parameter
  if (currencies[0] === "LIST") {
    currencies = list.currencies
  }
  try {
    const rates = await get.btc(fiat2btcUrl, vesUrl, currencies)
    const avg = await get.dashAverage(btc2dashAverageUrl)
    // 'rates' is an object containing requested fiat rates (ex. USD: 6500)
    // multiply each value in the object by the current BTC/DASH rate
    for (var key in rates) {
      if (rates.hasOwnProperty(key)) {
        rates[key] *= avg
      }
    }
    res.json(rates)
  } catch (error) {
    res.status(404).json(error)
  }
})

var port = process.env.PORT || 3000
app.listen(port)
console.log(`DashRates API v0.3.5 running on port http://localhost:${port}`)
