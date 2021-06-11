import * as dgram from 'dgram';
import { Des } from "data-crypto";
import * as Sleep from "sleep";

const DOCKER : boolean = false;

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}


const my_ip = (DOCKER) ? "10.0.0.11" : "192.168.1.111";
const server_ip_r1 : string = (DOCKER) ? "10.0.0.14" : "192.168.1.114";
const server_ip_r2 : string = (DOCKER) ? "10.0.0.12" : "192.168.1.112";
const server_port_r1 : number = 41234;
const server_port_r2 : number = 41234;
const _secret : string = "depl0yit";

const generate_pkt = (seq_number : number, destination_ip : string, high_security: boolean) => {
    const content = Math.random().toString(36).substring(2);
    const pkt : object = {};
    pkt["destination"] = destination_ip;
    pkt["n_forwards"] = (destination_ip === server_ip_r1) ? 1 : 3; //can be handles by traversing nodes
    pkt["seq_number"] = seq_number;
    pkt["content_encripted"] =  (destination_ip === server_ip_r1) ? content : Des.encrypt(content, _secret);
    // pkt["timestamp_sent"] = Number(process.hrtime.bigint());
    pkt["timestamp_sent"] = Date.now();
    pkt["high_security"] = high_security;
    return pkt;
}

const test = (packet_limit) => {

  console.log("ok sending")
  // for (var i = 0; i < packet_limit; i++){
  //   console.log(i)
  //   const high_security : boolean = (getRandomInt(3) === 0) ? true : false; //0,1,2
  //   const destination : object = (high_security) ? {ip: server_ip_r2, client: client_r2, port: server_port_r2} : {ip: server_ip_r1, client: client_r1, port: server_port_r1}; 
  //   const pkt = generate_pkt(i, destination["ip"], high_security);
  //   const pkt_as_string = JSON.stringify(pkt);
  //   destination["client"].send(Buffer.from(pkt_as_string), 0, pkt_as_string.length, destination["port"], destination["ip"], (err) => {
  //     // console.log(err)
  //     // client.close();
  //   });
  //   Sleep.usleep(1000 * 100); //microseconds = 10e-3 milliseconds
  //   // Sleep.msleep(10); 
  // }
  let counter = 0;
  const interval = setInterval(()=>{
    console.log(counter)
    const high_security : boolean = (getRandomInt(3) === 0) ? true : false; //0,1,2
    const destination : object = (high_security) ? {ip: server_ip_r2, client: client_r2, port: server_port_r2} : {ip: server_ip_r1, client: client_r1, port: server_port_r1}; 
    const pkt = generate_pkt(counter, destination["ip"], high_security);
    const pkt_as_string = JSON.stringify(pkt);
    destination["client"].send(Buffer.from(pkt_as_string), 0, pkt_as_string.length, destination["port"], destination["ip"], (err) => {
      // console.log(err)
      // client.close();
    });
    counter++;
    if (counter === packet_limit){
      Sleep.sleep(1);
      client_r1.send(Buffer.from("_END_OF_DIALOG_"), 0, "_END_OF_DIALOG_".length, server_port_r1, server_ip_r1, (err) => {
        // console.log(err)
        // client.close();
      });
      clearInterval(interval);
    } 
  },100);
}

const client_r1 = dgram.createSocket('udp4');
const client_r2 = dgram.createSocket('udp4');


test(100)
