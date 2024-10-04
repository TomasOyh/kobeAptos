const { exec } = require("child_process");
const path = require('path');
const projectDir = __dirname;

function runCommand(command) {
  return new Promise((resolve, reject) => {
    const process = exec(command, { cwd: projectDir }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return resolve(stderr || stdout);
      }
      resolve(stdout);
    });

    process.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    process.stderr.on("data", (data) => {
      console.error(data.toString());
    });
  });
}

async function deployToAptos() {
  const deployCommand = "echo yes|aptos move publish --profile testnet2 --sender-account 0x20de73f371c8b2140fe1677907df12a0acf0424d55da6720f0f3a84c6ca6d7fa";
  const deployResults = await runCommand(deployCommand);
  const regex = /Transaction hash: (\w+)/;
  const match = deployResults.match(regex);
  
  if (match && match[1]) {
    const transactionHash = match[1];
    console.log(`Contract deployed with transaction hash: ${transactionHash}`);
    return transactionHash;
  } else {
    console.error('Failed to extract transaction hash.');
    return null;
  }
}

module.exports = { deployToAptos };