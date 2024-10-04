const { generateMessageWithClaude } = require('./claudeApi');

function generateMovePrompt(userTask) {
    return `
Generate a Move smart contract for Aptos blockchain for the following task: ${userTask}. 
Answer ONLY with the Move code for Aptos smart contract. 
Don't add ANYTHING else. It's VERY IMPORTANT that the given CODE COMPILES. 

Follow these guidelines for creating a perfect Move smart contract:

1. Module Declaration and Addressing:
   - Use 'module 0x1::main {' as the module declaration.

2. Import Statements:
   - List all necessary imports at the beginning of the module.
   - Common imports include std::signer, aptos_framework::account, aptos_framework::event, aptos_std::table::Table.

3. Struct Definitions:
   - Define structs with appropriate abilities (key, store, drop, copy).
   - Use 'has key' for resource structs stored in global storage.

4. Function Definitions:
   - Specify function visibility (public, public(friend), or public entry for entry functions).
   - Use 'acquires' keyword for functions that access global storage.

5. Error Handling:
   - Define error constants at the module level.
   - Use 'assert!' for runtime checks.

6. Event Handling:
   - Define event structs with 'drop' and 'store' abilities.
   - Use event::EventHandle for storing events in resources.

7. Global Storage Operations:
   - Use 'move_to' to publish resources under an account.
   - Use 'borrow_global' and 'borrow_global_mut' to access global resources.

8. Vector and Table Operations:
   - Use appropriate vector and table functions when needed.

9. View Functions:
   - Use the '#[view]' attribute for functions that only read state.

10. Comments and Documentation:
    - Use '///' for doc comments on public functions and structs.
    - Use '//' for inline comments.

Here's an example of a well-structured Move smart contract:

module 0x1::main {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    /// Resource struct for storing contract data
    struct ContractData has key {
        value: u64,
        events: event::EventHandle<ValueUpdateEvent>,
    }

    /// Event emitted when value is updated
    struct ValueUpdateEvent has drop, store {
        old_value: u64,
        new_value: u64,
    }

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_INVALID_VALUE: u64 = 2;

    /// Initialize the contract for a given account
    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<ContractData>(addr), E_NOT_INITIALIZED);
        move_to(account, ContractData {
            value: 0,
            events: account::new_event_handle<ValueUpdateEvent>(account),
        });
    }

    /// Update the value in the contract
    public entry fun update_value(account: &signer, new_value: u64) acquires ContractData {
        let addr = signer::address_of(account);
        assert!(exists<ContractData>(addr), E_NOT_INITIALIZED);
        let contract_data = borrow_global_mut<ContractData>(addr);
        let old_value = contract_data.value;
        assert!(new_value != old_value, E_INVALID_VALUE);
        contract_data.value = new_value;
        event::emit_event(&mut contract_data.events, ValueUpdateEvent {
            old_value,
            new_value,
        });
    }

    /// Get the current value (view function)
    #[view]
    public fun get_value(addr: address): u64 acquires ContractData {
        assert!(exists<ContractData>(addr), E_NOT_INITIALIZED);
        borrow_global<ContractData>(addr).value
    }
}

Now, generate a Move smart contract that addresses the following task: ${userTask}
ANSWER ONLY WITH THE ASKED CODE. DONT PROVIDE ANYTHING ELSE
`;
}

function generateImprovementPrompt(moveCode, compilationResults, testResults) {
    return `
The following Move code for Aptos blockchain failed to compile or test with these errors:

Compilation results:
${compilationResults}

Test results:
${testResults}

Here's the code:

${moveCode}

Please fix the errors and provide the corrected code. Make sure to address the specific syntax errors mentioned. Only output the corrected Move code, nothing else. Ensure that you're following Move best practices and syntax rules, including:

1. Correct module declaration and addressing
2. Proper use of 'use' statements for imports
3. Correct struct definitions with appropriate abilities
4. Proper function visibility and 'acquires' usage
5. Correct error handling with 'assert!'
6. Proper event handling if applicable
7. Correct use of global storage operations (move_to, borrow_global, etc.)
8. Proper use of vector and table operations if applicable
9. Correct use of the '#[view]' attribute for view functions
10. Proper comments and documentation

Provide the complete, corrected Move code that addresses all the issues mentioned in the compilation and test results.
ANSWER ONLY WITH THE ASKED CODE. DONT PROVIDE ANYTHING ELSE
`;
}

module.exports = { generateMovePrompt, generateImprovementPrompt };