const express = require('express');
const { exec } = require("child_process");
const { performance } = require('perf_hooks');

// curl -X POST http://localhost:3000/asd -H 'Content-Type: application/json' -d '{"command":"ls"}'

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const executeCommand = (command) => {
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
    });
}

const measureCommandTime = (command) => {
    const startTime = performance.now()
    executeCommand(command);
    const endTime = performance.now();
    return endTime - startTime;
}

app.post('/executeCommand', (req, res) => {
    const command = req.body.command;
    const time_taken_by_command = measureCommandTime(command);
    res.json({time_ms: time_taken_by_command});
});

app.listen(port, () => {
  console.log(`Routing server app listening on port ${port}`)
})