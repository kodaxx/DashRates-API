const axios = require('axios')
const cache = require('./cache')
const get = require('./get')

// set bitcoin's average price against various fiat currencies
exports.BTCBitcoinAverage = function(url, vesUrl, [...currencies]) {
  const output = {}
  const cacheRef = '_BTCBitcoinAverageForList'

  cache.get(cacheRef, function(error, data) {
    if (error) throw error
    axios.get(url)
      .then(async result => {
        // for each currency passed into this function, we add a key/value to output (ex. USD: 6500.12345)
        for (var currency of currencies) {
          // we check if the currency is 'VES', since the rates given on BitcoinAverage are incorrect
          if (currency === 'VES') {
            // instead we get rates from CryptoCompare
            output[currency] = await get.BTCCryptoCompareVes(vesUrl)
          } else {
            // otherwise we use the "last" price from bitcoinaverage to give us the most recent exchange rate
            output[currency] = result.data[`BTC${currency}`].last
          }
        }
        // set the cache for this response and save for 60 seconds
        cache.setex(cacheRef, 70, JSON.stringify(output));
        console.log('cached _BTCBitcoinAverageForList')
      })
      .catch(error => {
        console.log(`Error: ${error}`)
        resolve(error)
      })
  })
}

// set bitcoin's average price against ves
exports.BTCCryptoCompareVes = function(url) {
  const cacheRef = '_BTCCryptoCompareVes'
  let output

  cache.get(cacheRef, function(error, data) {
    axios.get(url)
      .then(result => {
        // our output will equal the average since CryptoCompare returns the correct average
        output = result.data.VES
        // set the cache for this response and save for 70 seconds
        cache.setex(cacheRef, 70, JSON.stringify(output));
        console.log('cached _BTCCryptoCompareVes')
      })
      .catch(error => {
        console.log(`Error: ${error}`)
        resolve(error)
      })
  })
}

// set dash's average trading price from various exchanges
exports.DASHCryptoCompareAvg = function(url) {
  let output = {}
  const cacheRef = '_DASHCryptoCompareAvg'

  cache.get(cacheRef, function(error, data) {
    if (error) throw error
    axios.get(url)
      .then(async result => {
        // the output should equal the average price (ex. 0.02528)
        output = parseFloat(result.data.RAW.PRICE)
        // set the cache for this response and save for 70 seconds
        cache.setex(cacheRef, 70, JSON.stringify(output))
        console.log('cached _DASHCryptoCompareAvg')
      })
      .catch(error => {
        console.log(`Error: ${error}`)
        resolve(error)
      })
  })
}

// set the current DASH trading price from Poloniex
exports.DASHPoloniex = function(url) {
  const cacheRef = '_DASHPoloniex'

  cache.get(cacheRef, function(error, data) {
    if (error) throw error
    axios.get(url)
      .then(result => {
        let total = 0
        let amount = 0
        // loop through the results and get the total BTC traded, and the amount of DASH traded
        for (var i = 0; i < result.data.length; i++) {
          total += parseFloat(result.data[i].total)
          amount += parseFloat(result.data[i].amount)
        }
        // get the average price paid for the last 200 trades
        let average = total / amount
        // set the cache for this response and save for 70 seconds
        cache.setex(cacheRef, 70, JSON.stringify(average))
        console.log('cached _DASHPoloniex')
      })
      .catch(error => {
        console.log(`Error: ${error}`)
      })
  })
}

// set the current BTC/DASH price - we grab the "last" price from bitcoinaverage to get the most recent exchange rate
exports.BitcoinAverageDashBtc = function(url) {
  const cacheRef = '_bitcoinAverageDashBtc'

  cache.get(cacheRef, function(error, data) {
    if (error) throw error
    axios.get(url)
      .then(result => {
        const last = result.data.last
        // set the cache for this response and save for 60 seconds
        cache.setex(cacheRef, 70, JSON.stringify(last))
        console.log('cached _bitcoinAverageDashBtc')
      })
      .catch(error => {
        console.log(`Error: ${error}`)
        resolve(error)
      })
  })
}
