const axios = require('axios')

// this function gets us fiat/btc trading pairs for 167 currencies
exports.btc = function(url, vesUrl, [...currencies]) {
  const output = {}

  return new Promise(resolve => {
    axios.get(url)
      .then(async result => {
        for (var currency of currencies) {
          // we check if the currency is 'VES', since the rates given on BitcoinAverage are incorrect
          if (currency === 'VES') {
            // instead we get rates from CryptoCompare
            output[currency] = await exports.ves(vesUrl)
          } else {
            // otherwise we use the "last" price from bitcoinaverage to give us the most recent exchange rate
            output[currency] = result.data[`BTC${currency}`].last
          }
        }
        resolve(output)
      })
      .catch(error => {
        resolve(null)
        console.log(`error: ${error}`)
      })
  })
}

// this function gets us the ves/btc rates from a proper source, since btcaverage is wrong
exports.ves = function(url) {
  let output

  return new Promise(resolve => {
    axios.get(url)
      .then(result => {
        output = result.data.VES
        resolve(output)
      })
      .catch(error => {
        resolve(null)
        console.log(`error: ${error}`)
      })
  })
}

// this function gets us dash/btc average price across binance, kraken, poloniex, and bitfinex
exports.dashAverage = function (url) {
  let output

  return new Promise(resolve => {
    axios.get(url)
      .then(result => {
        output = parseFloat(result.data.RAW.PRICE)
        resolve(output)
      })
      .catch(error => {
        resolve(null)
        console.log(`error: ${error}`)
      })
  })
}

// these are backup functions in case one of our other sources fails
// get the current dash trading price from poloniex
exports.poloniex = function(url) {
  return new Promise(resolve => {
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
        resolve(average)
      })
      .catch(error => {
        resolve(null)
        console.log(`error: ${error}`)
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
