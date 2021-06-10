"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Net = require("net");
var mqttConnection = require("mqtt-connection");
var fs = require("fs");
var DOCKER = false;
var my_ip = (DOCKER) ? "10.0.0.14" : "192.168.1.114";
var port = 1883;
var _secret = "depl0yit";
var received_pkts_buffer = [];
var createReport = function () {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var min = today.getMinutes();
    var s = today.getSeconds();
    var file_name = hh + "_" + min + "_" + s + "_" + dd + "_" + mm + "_" + yyyy + ".csv";
    fs.appendFileSync(file_name, "seq_number,content_encripted,high_security,n_forwards,destination,timestamp_sent,timestamp_received,latency");
    for (var i in received_pkts_buffer) {
        console.log(received_pkts_buffer["seq_number"]);
        var row = received_pkts_buffer[i];
        var latency = Number(row[i]["timestamp_received"]) - Number(row[i]["timestamp_sent"]);
        fs.appendFile(file_name, "\n" + row[i]["seq_number"] + ",\n          " + row[i]["content_encripted"] + ",\n          " + row[i]["high_security"] + ",\n          " + row[i]["n_forwards"] + ",\n          " + row[i]["destination"] + ",\n          " + row[i]["timestamp_sent"] + ",\n          " + row[i]["timestamp_received"] + ",\n          " + latency, function (err) {
            if (err)
                throw err;
            console.log("row" + i + " ok");
        });
    }
};
var server = new Net.Server();
server.on('connection', function (stream) {
    var client = mqttConnection(stream);
    client.on('connect', function (packet) {
        client.connack({ returnCode: 0 });
    });
    client.on('publish', function (packet) {
        console.log("--------------------------------------------------");
        console.log("received", packet);
        console.log("received payload", JSON.parse(packet.payload.toString()));
        var pkt_as_string = packet.payload.toString;
        if (pkt_as_string === "_END_OF_DIALOG_") {
            server.close();
            createReport();
        }
        else {
            var packet_parsed = JSON.parse(pkt_as_string);
            packet_parsed["timestamp_received"] = Number(process.hrtime.bigint());
            received_pkts_buffer.push(packet_parsed);
        }
    });
    client.on('pingreq', function () {
        client.pingresp();
    });
    client.on('subscribe', function (packet) {
        client.suback({ granted: [packet.qos], messageId: packet.messageId });
    });
    stream.setTimeout(1000 * 60 * 5);
    client.on('close', function () { client.destroy(); });
    client.on('error', function () { client.destroy(); });
    client.on('disconnect', function () { client.destroy(); });
    stream.on('timeout', function () { client.destroy(); });
});
server.listen(1883, function () { console.log("listening"); });
//# sourceMappingURL=app.js.map