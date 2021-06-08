
import * as Net from "net";
import { Des, TripleDes } from "data-crypto";
import * as Sleep from "sleep";



const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

const server_ip_r1 : string = "10.0.0.14";
const server_ip_r2 : string = "10.0.0.12";
const server_port_r1 : number = 8225;
const server_port_r2 : number = 8225;
const _secret : string = "depl0yit";
const packet_limit : number = 300;

const generate_pkt = (seq_number : number, destination_ip : string) => {
    const content = Math.random().toString(36).substring(2);
    const pkt : object = {};
    pkt["destination"] = destination_ip;
    pkt["n_forwards"] = (destination_ip === server_ip_r1) ? 1 : 3; //can be handles by traversing nodes
    pkt["seq_number"] = seq_number;
    pkt["content_encripted"] =  (destination_ip === server_ip_r1) ? TripleDes.encrypt(content, _secret) : Des.encrypt(content, _secret);
    pkt["timestamp"] = process.hrtime.bigint();
}

const test1 = () => {
    let counter : number = 0;

    const sendPacket = async () => {
        const high_security : boolean = (getRandomInt(3) === 0) ? true : false; //0,1,2
        const destination : object = (high_security) ? {ip: server_ip_r2, client: client_r2} : {ip: server_ip_r1, client: client_r1}; 
        const pkt = generate_pkt(counter, destination["ip"]);
        destination["client"].write(JSON.stringify(pkt));
        Sleep.usleep(1000); //microseconds = 10e-3 milliseconds
        counter++;
        (counter <= packet_limit) && sendPacket();
    }

}

const client_r1 = Net.createConnection({ port: server_port_r1, host: server_ip_r1 }, () => {
    // 'connect' listener.
    console.log('connected to server ['+server_ip_r1+']!');
});
client_r1.setEncoding('utf8');
client_r1.on('error', (err) => {
    // Handle errors here.
    throw err;
});

client_r1.on('data', (data) => {
    console.log(data.toString());
    // client.end();
});

client_r1.on('end', () => {
    console.log('disconnected from server');
});


const client_r2 = Net.createConnection({ port: server_port_r2, host: server_ip_r2 }, () => {
    // 'connect' listener.
    console.log('connected to server ['+server_ip_r2+']!');
});
client_r2.setEncoding('utf8');
client_r2.on('error', (err) => {
    // Handle errors here.
    throw err;
});

client_r2.on('data', (data) => {
    console.log(data.toString());
    // client.end();
});

client_r2.on('end', () => {
    console.log('disconnected from server');
});

test1();