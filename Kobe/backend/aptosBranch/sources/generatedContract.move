module 0x1::mycontract {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event;

    struct ContractData has key {
        value: u64,
        update_events: event::EventHandle<UpdateEvent>,
    }

    struct UpdateEvent has drop, store {
        old_value: u64,
        new_value: u64,
    }

    const E_NOT_INITIALIZED: u64 = 1;

    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<ContractData>(addr), E_NOT_INITIALIZED);
        move_to(account, ContractData {
            value: 0,
            update_events: account::new_event_handle<UpdateEvent>(account),
        });
    }

    public entry fun update_value(account: &signer, new_value: u64) acquires ContractData {
        let addr = signer::address_of(account);
        assert!(exists<ContractData>(addr), E_NOT_INITIALIZED);
        let contract_data = borrow_global_mut<ContractData>(addr);
        let old_value = contract_data.value;
        contract_data.value = new_value;
        event::emit_event(&mut contract_data.update_events, UpdateEvent {
            old_value,
            new_value,
        });
    }

    #[view]
    public fun get_value(addr: address): u64 acquires ContractData {
        assert!(exists<ContractData>(addr), E_NOT_INITIALIZED);
        borrow_global<ContractData>(addr).value
    }
}