const express = require('express');
const { exec } = require('child_process');
const { performance } = require('perf_hooks');

// https://unix.stackexchange.com/questions/11851/iptables-allow-certain-ips-and-block-all-other-connection
// curl -X POST http://localhost:3000/asd -H 'Content-Type: application/json' -d '{"command":"ls"}'

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const executeCommand = function (command, fn) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        fn(performance.now());
        // res.json({time_ms: performance.now() - startTime});
    });
}

const measureCommandTime = (command, res) => {
    const startTime = performance.now();
    executeCommand(command, (endTime)=>{
        res.json({time_ms: endTime - startTime});
    });
}

app.post('/executePlainCommand', (req, res) => {
    const command = req.body.command;
    measureCommandTime(command, res);
});


app.post('/executeNetworkingRule', (req, res) => {
    const network_rule = req?.body?.zoneExtensionEdgeNodeList?.[0];
    if (network_rule?.trafficRuleList) {
        // sudo iptables -A INPUT -s 192.168.1.1 -j ACCEPT
        let command = "";
        for (var i in network_rule.trafficRuleList){
            const rule = network_rule.trafficRuleList[i];
            command += (i==0) ? "" : " && ";
            command += `sudo iptables -A ${rule.trafficType} -s ${(rule.trafficType == "OUTPUT") ? rule.destinationIpAddress : rule.sourceIpAddress} -j ACCEPT`;
        }
        // drop other IPs (INPUT AND OUTPUT)
        command += (command.length == 0) ? "" : " && iptables -P INPUT DROP && iptables -P OUTPUT DROP"; 
        console.log(command)
        // measureCommandTime(command, res);
    }
});

app.listen(port, () => {
  console.log(`Routing server app listening on port ${port}`)
})