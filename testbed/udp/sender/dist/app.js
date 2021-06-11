"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dgram = require("dgram");
var data_crypto_1 = require("data-crypto");
var Sleep = require("sleep");
var DOCKER = false;
var getRandomInt = function (max) {
    return Math.floor(Math.random() * max);
};
var my_ip = (DOCKER) ? "10.0.0.11" : "192.168.1.111";
var server_ip_r1 = (DOCKER) ? "10.0.0.14" : "192.168.1.114";
var server_ip_r2 = (DOCKER) ? "10.0.0.12" : "192.168.1.112";
var server_port_r1 = 41234;
var server_port_r2 = 41234;
var _secret = "depl0yit";
var generate_pkt = function (seq_number, destination_ip, high_security) {
    var content = Math.random().toString(36).substring(2);
    var pkt = {};
    pkt["destination"] = destination_ip;
    pkt["n_forwards"] = (destination_ip === server_ip_r1) ? 1 : 3;
    pkt["seq_number"] = seq_number;
    pkt["content_encripted"] = (destination_ip === server_ip_r1) ? content : data_crypto_1.Des.encrypt(content, _secret);
    pkt["timestamp_sent"] = Date.now();
    pkt["high_security"] = high_security;
    return pkt;
};
var test = function (packet_limit) {
    console.log("ok sending");
    for (var i = 0; i < packet_limit; i++) {
        console.log(i);
        var high_security = (getRandomInt(3) === 0) ? true : false;
        var destination = (high_security) ? { ip: server_ip_r2, client: client_r2, port: server_port_r2 } : { ip: server_ip_r1, client: client_r1, port: server_port_r1 };
        var pkt = generate_pkt(i, destination["ip"], high_security);
        var pkt_as_string = JSON.stringify(pkt);
        destination["client"].send(Buffer.from(pkt_as_string), 0, pkt_as_string.length, destination["port"], destination["ip"], function (err) {
        });
        Sleep.usleep(1000 * 100);
    }
    Sleep.sleep(1);
    client_r1.send(Buffer.from("_END_OF_DIALOG_"), 0, "_END_OF_DIALOG_".length, server_port_r1, server_ip_r1, function (err) {
    });
};
var client_r1 = dgram.createSocket('udp4');
var client_r2 = dgram.createSocket('udp4');
test(100);
//# sourceMappingURL=app.js.map