const fs = require('fs');
const axios = require('axios');
const { exec } = require("child_process");
const path = require('path');
const { generateMovePrompt, generateImprovementPrompt } = require('./longstrings');
const { generateMessageWithClaude } = require('./claudeApi');

const apiKey = process.env.OPENAI_API_KEY;
const projectDir = __dirname;

async function generateMessage(prompt, model) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model,
      messages: [
        {
          role: "system",
          content: `You are an AI model specialized in blockchain technology, in creating smart contracts in Move for Aptos blockchain, tests, and detecting versions given a contract. You will answer ONLY with the task you are provided.`
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 3000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    let content = response.data.choices[0].message.content.trim();
    content = content.replace(/```(move)?/g, '').replace(/```/g, '').trim();
    return content;
  } catch (error) {
    console.error("Error generating message:", error);
    throw error;
  }
}

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

const model = 'gpt-4o-2024-08-06';

async function generateMoveSmartContract(userTask) {
  try {
    const movePrompt = generateMovePrompt(userTask);
    let moveCode = await generateMessageWithClaude(movePrompt);
    const moveFilePath = path.join(projectDir, 'sources/generatedContract.move');
    fs.writeFileSync(moveFilePath, moveCode);
    console.log(`Written code to ${moveFilePath}`);

    for (let i = 0; i < 3; i++) {
      try {
        console.log("Compiling contract...");
        const compilationResults = await runCommand("aptos move compile");
        console.log(`Compilation results: ${compilationResults}`);

        console.log("Generating tests...");
        const testPrompt = `
Generate comprehensive Move test code for the following Move contract:

${moveCode}

Follow these instructions for creating Move smart contract tests:

1. Set up the test environment:
   - Create a new test module with the #[test_only] attribute.
   - Name the module appropriately, typically module_name_tests.
   - Import necessary dependencies, including the module being tested.

2. Create helper functions:
   - Implement a create_signer() function to generate test accounts.
   - Add any other helper functions that might be reused across multiple tests.

3. Structure each test:
   - Use the #[test] attribute for each test function.
   - Follow the Arrange-Act-Assert (AAA) pattern in each test.

4. Cover all main functionalities:
   - Write tests for each public function in the smart contract.
   - Include tests for both successful execution and error cases.

5. Test state changes:
   - Verify that functions correctly modify the contract's state.
   - Check state before and after actions to ensure correct changes.

6. Use #[expected_failure]:
   - For functions that should fail under certain conditions, use the #[expected_failure(abort_code = X)] attribute.
   - Specify the expected abort code if known.

7. Test boundary conditions:
   - Include tests for edge cases and boundary values.
   - Test minimum and maximum values where applicable.

8. Event testing:
   - If the contract emits events, write tests to verify event emission.
   - Check event contents and conditions under which events are emitted.

9. Use meaningful assertions:
   - Write clear assert! statements with descriptive error messages.
   - Use custom error codes to distinguish between different failure points.

10. Maintain test independence:
    - Each test should be independent and not rely on the state from other tests.
    - Use the create_signer() function to get a fresh account for each test.

11. Comment and document:
    - Add brief comments explaining the purpose of each test.
    - Use descriptive function names that indicate what is being tested.

Here's an example of a well-structured Move test module:

#[test_only]
module 0x1::my_module_tests {
    use std::signer;
    use aptos_framework::account;
    use 0x1::my_module;

    fun create_signer(): signer {
        account::create_account_for_test(@0x1)
    }

    #[test]
    fun test_module_initialization() {
        let account = create_signer();
        my_module::initialize(&account);
        assert!(my_module::is_initialized(@0x1), 0);
    }

    #[test]
    #[expected_failure(abort_code = 0x1)]
    fun test_double_initialization() {
        let account = create_signer();
        my_module::initialize(&account);
        my_module::initialize(&account);  // Should fail
    }

    #[test]
    fun test_update_value() {
        let account = create_signer();
        my_module::initialize(&account);
        my_module::update_value(&account, 42);
        assert!(my_module::get_value(@0x1) == 42, 1);
    }

    // Additional tests...
}

Now, generate comprehensive test code for the provided Move contract.
ANSWER ONLY WITH THE ASKED CODE. DONT PROVIDE ANYTHING ELSE
`;
const testCode = await generateMessageWithClaude(testPrompt);
const testFilePath = path.join(projectDir, 'tests/generatedContract_test.move');
fs.writeFileSync(testFilePath, testCode);

console.log("Running tests...");
const testResults = await runCommand("aptos move test");
console.log(`Test results: ${testResults}`);

if (testResults.includes("Success")) {
  console.log("All tests passed!");
  return { moveCode, testResults };
}

console.log("Generating improvement prompt...");
const improvementPrompt = generateImprovementPrompt(moveCode, compilationResults, testResults);
        
console.log("Generating improved code...");
moveCode = await generateMessageWithClaude(improvementPrompt);
fs.writeFileSync(moveFilePath, moveCode);
console.log(`Improved code written to ${moveFilePath}`);

      } catch (error) {
        console.error(`Error during iteration ${i}:`, error);
        break;
      }
    }

    return { moveCode, testResults: "Failed to pass all tests after 3 iterations." };
    
  } catch (error) {
    console.error("An error occurred during the process.", error);
    throw error;
  }
}

module.exports = { generateMoveSmartContract };