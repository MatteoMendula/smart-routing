const { exec } = require("child_process");


console.time('docker_swarm_init');

exec("docker swarm init", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});

console.timeEnd('docker_swarm_init');
