// author: Matteo Mendula
// date: April 2021
// ref here: https://gist.github.com/sid24rane/2b10b8f4b2f814bd0851d861d3515a10
// performance: https://stackoverflow.com/questions/1235958/ipc-performance-named-pipe-vs-socket

import * as Net from "net";
import * as mqttConnection from "mqtt-connection";
import { Des, TripleDes } from "data-crypto";
import * as fs from "fs";

const DOCKER : boolean = false;

const my_ip : string = (DOCKER) ? "10.0.0.14" : "192.168.1.114";
const my_port : number = 1883;
const _secret : string = "depl0yit";


const received_pkts_buffer : Array<object> = [];

const createReport = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();
  const hh = today.getHours();
  const min = today.getMinutes();
  const s = today.getSeconds();
  const file_name = `${hh}_${min}_${s}_${dd}_${mm}_${yyyy}.csv`;
  fs.appendFileSync(file_name, `seq_number,content_encripted,high_security,n_forwards,destination,timestamp_sent,timestamp_received,latency`);

  for (var i in received_pkts_buffer){
    console.log(received_pkts_buffer["seq_number"]);
    const row = received_pkts_buffer[i];
    const latency = Number(row[i]["timestamp_received"]) - Number(row[i]["timestamp_sent"])
    fs.appendFile(file_name, 
      `\n${row[i]["seq_number"]},
          ${row[i]["content_encripted"]},
          ${row[i]["high_security"]},
          ${row[i]["n_forwards"]},
          ${row[i]["destination"]},
          ${row[i]["timestamp_sent"]},
          ${row[i]["timestamp_received"]},
          ${latency}`
      , function (err) {
        if (err) throw err;
        console.log(`row${i} ok`);
    });
  }
}

const server = new Net.Server();


server.on('connection', function (stream) {
  var client = mqttConnection(stream);

  // client connected
  client.on('connect', function (packet) {
    // acknowledge the connect packet
    client.connack({ returnCode: 0 });
  })

  // client published
  client.on('publish', function (packet) {
    // send a puback with messageId (for QoS > 0)
    // client.puback({ messageId: packet.messageId })
    console.log("--------------------------------------------------")
    console.log("received", packet)
    // console.log("received payload", packet.payload.toString())
    console.log("received payload", JSON.parse(packet.payload.toString()))

    const pkt_as_string : string = packet.payload.toString();

    if (pkt_as_string === "_END_OF_DIALOG_"){
      server.close();
      createReport();
    }else{
      const packet_parsed : object = JSON.parse(pkt_as_string);
      packet_parsed["timestamp_received"] = Number(process.hrtime.bigint());
      received_pkts_buffer.push(packet_parsed);
    }
})

  // client pinged
  client.on('pingreq', function () {
    // send a pingresp
    client.pingresp()
  });

  // client subscribed
  client.on('subscribe', function (packet) {
    // send a suback with messageId and granted QoS level
    client.suback({ granted: [packet.qos], messageId: packet.messageId })
  })

  // timeout idle streams after 5 minutes
  stream.setTimeout(1000 * 60 * 5)

  // connection error handling
  client.on('close', function () { client.destroy() })
  client.on('error', function () { client.destroy() })
  client.on('disconnect', function () { client.destroy() })

  // stream timeout
  stream.on('timeout', function () { client.destroy(); })
})

// listen on port 1883
server.listen(my_port, ()=>{console.log("listening")})

