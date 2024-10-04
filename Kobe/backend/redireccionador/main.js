const axios = require("axios");
const path = require("path");
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const io = require("socket.io")(3002, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function (...args) {
  io.emit("console_log", args.join(" "));
  originalConsoleLog.apply(console, args);
};

console.error = function (...args) {
  io.emit("console_error", args.join(" "));
  originalConsoleError.apply(console, args);
};


const { generateMessageWithClaude } = require(path.join(__dirname,"../aptosBranch/claudeApi"));
const { handleQuery } = require(path.join(__dirname, "../ragBranch/index")); // Importa la función handleQuery
const { generateMoveSmartContract } = require(path.join(__dirname, "../aptosBranch/main"));

const apiKey =process.env.OPENAI_API_KEY;

async function RAGMODEL(input) {
  try {
    console.log("Ejecutando RAGMODEL...");

    // Utilizar la función handleQuery de ragBranch
    const result = await handleQuery(input);
    return "Usando RAGMODEL";
  } catch (error) {
    console.error("Error in RAGMODEL:", error);
    throw error;
  }
}

async function normalModel(prompt) {
  return " ";
}

async function codigoAPTOS(input) {
  try {
    console.log("Generating concise instruction for smart contract in Move for Aptos blockchain...");

    const conciseInstruction = await generateMessageWithClaude(
      `Generate a concise and clear instruction for creating a Move smart contract based on this input: ${input}`
    );

    const { moveCode, testResults } = await generateMoveSmartContract(conciseInstruction);

    return `Código Move Generado:\n${moveCode}\n\nResultados de las pruebas:\n${testResults}`;
  } catch (error) {
    console.error("Error in MoveCode:", error);
    throw error;
  }
}

// Función que determina la acción a tomar basada en el input del usuario
async function generateMessage(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
            You are an AI model specialized in blockchain technology. Based on the user's input, you need to indicate one or more of the following actions that need to be executed:
            Analyze the input and decide the appropriate actions, returning the responses as an array of options ONLY ANSWER WITH THE ARRAY.
            You can return multiple responses if necessary.

            1. If the input involves a problem or request that requires Solidity code, add 1 to the array.
            2. If the input involves a problem or request that requires Solana code, add 2 to the array.
            3. If the input is a specific question related to blockchain, smart contracts, or related technologies, add 3 to the array.
            4. If the input is a question of another subject, add 4 to the array.
            5. If the input involves a problem or request that request aptos Move code, add 5 to the array
          `,
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const answer = response.data.choices[0].message.content.trim();
    const numberArray = JSON.parse(answer);
    return numberArray;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Función para formatear la respuesta final
async function formatResponse(input, result) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
            You are an AI model specialized in generating well-formatted and cohesive text. The user will provide some raw output and an input, and your job is to format the raw output into a polished final response.
            The final response should be clear, well-structured, and appropriately formatted.
          `,
          },
          { role: "user", content: `Input: ${input}`},
          { role: "user", content: `Raw Output: ${result}`},
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const formattedResponse = response.data.choices[0].message.content.trim();
    return formattedResponse;
  } catch (error) {
    console.error("Error en el formateador:", error);
    return result; // En caso de error, devuelve el resultado sin formatear.
  }
}

async function processInput(input) {
  const answer = await generateMessage(input);
  let result = "";
  if (answer.includes(3)) {
    result += (await RAGMODEL(input)) + "\n";
  }
  if (answer.includes(4)) {
    result += (await normalModel(input)) + "\n";
  }
  if (answer.includes(5)) {
    result += (await codigoAPTOS(input)) + "\n";
  }

  const finalResponse = await formatResponse(input, result.trim());
  return finalResponse;
}

// Función asíncrona para ejecutar el código y mostrar el resultado
// async function run() {
//   const response = await processInput("");
//   console.log(response);
// }

// run();

// Exportar la función
module.exports = { processInput };
