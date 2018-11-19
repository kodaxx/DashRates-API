var client = require('redis').createClient(process.env.REDIS_URL);

// Log any errors
client.on('error', function(error) {
  console.log('Error:')
  console.log(error)
})

module.exports = client
