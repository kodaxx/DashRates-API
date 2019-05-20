setInterval(function(){
  axios.get('/avg', { proxy: { host: '127.0.0.1', port: 3000 } })
    .then(async result => {
      console.log(result)
    })
    .catch(error => {
      console.log(`error: ${error}`)
    })
}, 3000);
