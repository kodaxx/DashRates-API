const axios = require('axios')
const cache = require('./cache')

// get bitcoin's average price against various fiat currencies
exports.BTCBitcoinAverage = function(url, vesUrl, [...currencies]) {
  const output = {}
  const cacheRef = '_cachedBitcoinAverageFor_' + currencies

  return new Promise(resolve => {
    cache.get(cacheRef, function(error, data) {
      if (error) throw error
      // if the data is in cache, return that
      if (!!data) {
        resolve(JSON.parse(data))
      } else {
        axios.get(url)
          .then(async result => {
            // for each currency passed into this function, we add a key/value to output (ex. USD: 6500.12345)
            for (var currency of currencies) {
              // we check if the currency is 'VES', since the rates given on BitcoinAverage are incorrect
              if (currency === 'VES') {
                // instead we get rates from CryptoCompare
                output[currency] = await exports.BTCCryptoCompareVes(vesUrl)
              } else {
                // otherwise we use the "last" price from bitcoinaverage to give us the most recent exchange rate
                output[currency] = result.data[`BTC${currency}`].last
              }
            }
            // set the cache for this response and save for 30 seconds
            cache.setex(cacheRef, 30, JSON.stringify(output));
            // resolve an object containing all requested currencies
            resolve(output)
          })
          .catch(error => {
            console.log(`Error: ${error}`)
            resolve(error)
          })
      }
    })
  })
}

// get bitcoin's average price against ves
exports.BTCCryptoCompareVes = function(url) {
  const cacheRef = '_cachedVES'
  let output

  return new Promise(resolve => {
    cache.get(cacheRef, function(error, data) {
      if (error) throw error
      // if the data is in cache, return that
      if (!!data) {
        resolve(JSON.parse(data))
      } else {
        axios.get(url)
          .then(result => {
            // our output will equal the average since CryptoCompare returns the correct average
            output = result.data.VES
            // set the cache for this response and save for 30 seconds
            cache.setex(cacheRef, 30, JSON.stringify(output));
            resolve(output)
          })
          .catch(error => {
            console.log(`Error: ${error}`)
            resolve(error)
          })
      }
    })
  })
}

// get dash's average trading price from various exchanges
exports.DASHCryptoCompareAvg = function(url) {
  let output = {}
  const cacheRef = '_cachedCryptoCompareAvg'

  return new Promise(resolve => {
    cache.get(cacheRef, function(error, data) {
      if (error) throw error
      // if the data is in cache, return that
      if (!!data) {
        resolve(JSON.parse(data))
        console.log('Grabbed _cachedCryptoCompareAvg')
      } else {
        axios.get(url)
          .then(async result => {
            // the output should equal the average price (ex. 0.02528)
            output = parseFloat(result.data.RAW.PRICE)
            // set the cache for this response and save for 30 seconds
            cache.setex(cacheRef, 30, JSON.stringify(output))
            // resolve an object containing all requested currencies
            resolve(output)
          })
          .catch(error => {
            console.log(`Error: ${error}`)
            resolve(error)
          })
      }
    })
  })
}

// get the current DASH trading price from Poloniex
exports.DASHPoloniex = function(url) {
  const cacheRef = '_cachedPoloniexDash'

  return new Promise(resolve => {
    cache.get(cacheRef, function(error, data) {
      if (error) throw error
      // if the data is in cache, return that
      if (!!data) {
        resolve(JSON.parse(data))
        console.log('Grabbed _cachedPoloniexDash')
      } else {
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
            // set the cache for this response and save for 30 seconds
            cache.setex(cacheRef, 30, JSON.stringify(average))
            resolve(average)
          })
          .catch(error => {
            console.log(`Error: ${error}`)
            resolve(false)
          })
      }
    })
  })
}

// get the current BTC/DASH price - we grab the "last" price from bitcoinaverage to get the most recent exchange rate
exports.BitcoinAverageDashBtc = function (url) {
  const cacheRef = '_cachedDashBTC'

  return new Promise(resolve => {
    cache.get(cacheRef, function(error, data) {
      if (error) throw error
      // if the data is in cache, return that
      if (!!data) {
        resolve(JSON.parse(data))
        console.log('Grabbed _cachedDashBTC')
      } else {
        axios.get(url)
          .then(result => {
            const last = result.data.last
            // set the cache for this response and save for 30 seconds
            cache.setex(cacheRef, 30, JSON.stringify(last))
            resolve(last)
          })
          .catch(error => {
            console.log(`Error: ${error}`)
            resolve(error)
          })
      }
    })
  })
}
