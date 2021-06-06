// author: Matteo Mendula
// date: April 2021
// ref here: https://gist.github.com/sid24rane/2b10b8f4b2f814bd0851d861d3515a10
// performance: https://stackoverflow.com/questions/1235958/ipc-performance-named-pipe-vs-socket

import * as Net from "net";

const server = Net.createServer();
server.maxConnections = 10;
server.on('close',function(){
    console.log('Server closed !');
  });

server.on('connection',function(socket){

    socket.setEncoding('utf8');

    socket.setTimeout(800000,function(){
        // called after timeout -> same as socket.on('timeout')
        // it just tells that soket timed out => its ur job to end or destroy the socket.
        // socket.end() vs socket.destroy() => end allows us to send final data and allows some i/o activity to finish before destroying the socket
        // whereas destroy kills the socket immediately irrespective of whether any i/o operation is goin on or not...force destry takes place
        console.log('Socket timed out');
    });

    socket.on('data',function(data){
        const bread = socket.bytesRead;
        const bwrite = socket.bytesWritten;
        // console.log('Bytes read : ' + bread);
        // console.log('Bytes written : ' + bwrite);
        console.log('Data sent to server : ' + data);
    });
    socket.on('drain',function(){
        console.log('write buffer is empty now .. u can resume the writable stream');
        socket.resume();
    });
    socket.on('timeout',function(){
        console.log('Socket timed out !');
        socket.end('Timed out!');
        // can call socket.destroy() here too.
      });
    socket.on('error',function(error){
        console.log('Error : ' + error);
    });
    socket.on('end', () => {
        console.log('client disconnected');
    });
    socket.on('close',function(error){
        const bread = socket.bytesRead;
        const bwrite = socket.bytesWritten;
        console.log('Bytes read : ' + bread);
        console.log('Bytes written : ' + bwrite);
        console.log('Socket closed!');
        if(error){
          console.log('Socket was closed coz of transmission error');
        }
    }); 
});


server.on('error', (err) => {
    console.log('Error: ' + err);
    throw err;
});



// Grab an arbitrary unused port.
server.listen(
    {
    // host: (host?.docker?.internal) ? host?.docker?.internal :'localhost',
    // host: 'localhost',
    host: "10.0.0.14",
    port: 8225,
    exclusive: true
},() => {
    const address : Net.AddressInfo = server.address() as Net.AddressInfo;
    const port = address.port;
    const family = address.family;
    const ipaddr = address.address;
    console.log('Server is listening at port' + port);
    console.log('Server ip :' + ipaddr);
    console.log('Server is IP4/IP6 : ' + family);
});

const islistening = server.listening;

if(islistening){
  console.log('Server is listening');
}else{
  console.log('Server is not listening');
}

setTimeout(function(){
  server.close();
},5000000);

