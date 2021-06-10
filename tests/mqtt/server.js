const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const port = 1883

server.listen(port, function () {
  console.log('server started and listening on port ', port)
})

server.on('subscribe', function (subscriptions, client) {
    console.log("s")
    if (client) {
      console.log('subscribe from client', subscriptions, client.id)
    }
  })

server.on('publish', function (packet, client) {
    console.log("p")

    if (client) {
      console.log('message from client', client.id)
    }
  })