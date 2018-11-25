const axios = require('axios')
const cache = require('./cache')

// set bitcoin's average price against various fiat currencies
exports.BTCBitcoinAverage = function([...currencies]) {
  return new Promise(resolve => {
    const output = {}
    const cacheRef = '_BTCBitcoinAverageForList'

    cache.get(cacheRef, function(error, data) {
      if (error) throw error
      // if the data is in cache, return that
      if (!!data) {
        if (currencies[0] === 'LIST') {
          resolve(JSON.parse(data))
        }
        // for each currency passed into this function, we add a key/value to output (ex. USD: 6500.12345)
        for (var currency of currencies) {
          // otherwise we use the "last" price from bitcoinaverage to give us the most recent exchange rate
          output[currency] = JSON.parse(data)[`${currency}`]
        }
        resolve(output)
        console.log('get _BTCBitcoinAverageForList')
      } else {
        console.log('_BTCBitcoinAverageForList empty')
        resolve(null)
      }
    })
  })
}

// get bitcoin's average price against ves
exports.BTCCryptoCompareVes = function() {
  return new Promise(resolve => {
    const cacheRef = '_BTCCryptoCompareVes'

    cache.get(cacheRef, function(error, data) {
      if (error) throw error
      // if the data is in cache, return that
      if (!!data) {
        resolve(JSON.parse(data))
        console.log('get _BTCCryptoCompareVes')
      } else {
        console.log('_BTCCryptoCompareVes empty')
        resolve(null)
      }
    })
  })
}

// get dash's average trading price from various exchanges
exports.DASHCryptoCompareAvg = function() {
  return new Promise(resolve => {
    const cacheRef = '_DASHCryptoCompareAvg'

    cache.get(cacheRef, function(error, data) {
      if (error) throw error
      // if the data is in cache, return that
      if (!!data) {
        resolve(JSON.parse(data))
        console.log('get _DASHCryptoCompareAvg')
      } else {
        console.log('_DASHCryptoCompareAvg empty')
        resolve(null)
      }
    })
  })
}

// get the current DASH trading price from Poloniex
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
        // set the cache for this response and save for 60 seconds
        cache.setex(cacheRef, 60, JSON.stringify(average))
        console.log('cached _DASHPoloniex')
      })
      .catch(error => {
        console.log(`Error: ${error}`)
      })
  })
}

// get the current BTC/DASH price - we grab the "last" price from bitcoinaverage to get the most recent exchange rate
exports.BitcoinAverageDashBtc = function() {
  return new Promise(resolve => {
    const cacheRef = '_bitcoinAverageDashBtc'

    cache.get(cacheRef, function(error, data) {
      if (error) throw error
      // if the data is in cache, return that
      if (!!data) {
        resolve(JSON.parse(data))
        console.log('get _bitcoinAverageDashBtc')
      } else {
        console.log('_bitcoinAverageDashBtc empty')
        resolve(null)
      }
    })
  })
}

// get invoice number from CoinText
exports.invoice = function(address, amount) {
  return new Promise(resolve => {
    const data = {
      'address': address,
      'amount': amount,
      'network': 'dash',
      'api_key': process.env.API_KEY
    }

    const headers = {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }

    axios.post('https://pos-api.cointext.io/create_invoice/', data, headers)
      .then((res) => {
        console.log(res.data)
        resolve(res.data.paymentId)
      })
      .catch((err) => {
        console.log(error)
        resolve(error)
      })
  })
}
