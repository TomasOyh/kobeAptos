#[test_only]
module 0x1::soccer_game_tests {
    use std::string;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use 0x1::SoccerGame;

    fun create_signer(addr: address): signer {
        account::create_account_for_test(addr)
    }

    #[test]
    fun test_initialize_game() {
        let admin = create_signer(@0x123);
        SoccerGame::initialize_game(&admin, string::utf8(b"Team A"), string::utf8(b"Team B"));
        assert!(SoccerGame::get_game_status(@0x123) == 0, 0);
    }

    #[test]
    #[expected_failure(abort_code = 2)]
    fun test_double_initialization() {
        let admin = create_signer(@0x123);
        SoccerGame::initialize_game(&admin, string::utf8(b"Team A"), string::utf8(b"Team B"));
        SoccerGame::initialize_game(&admin, string::utf8(b"Team C"), string::utf8(b"Team D"));
    }

    #[test]
    fun test_start_game() {
        let admin = create_signer(@0x123);
        SoccerGame::initialize_game(&admin, string::utf8(b"Team A"), string::utf8(b"Team B"));
        SoccerGame::start_game(&admin);
        assert!(SoccerGame::get_game_status(@0x123) == 1, 0);
    }

    #[test]
    #[expected_failure(abort_code = 4)]
    fun test_start_game_twice() {
        let admin = create_signer(@0x123);
        SoccerGame::initialize_game(&admin, string::utf8(b"Team A"), string::utf8(b"Team B"));
        SoccerGame::start_game(&admin);
        SoccerGame::start_game(&admin);
    }

    #[test]
    fun test_score_goal() {
        let admin = create_signer(@0x123);
        timestamp::set_time_has_started_for_testing(&admin);
        SoccerGame::initialize_game(&admin, string::utf8(b"Team A"), string::utf8(b"Team B"));
        SoccerGame::start_game(&admin);
        SoccerGame::score_goal(&admin, string::utf8(b"Team A"));
        let (score1, score2) = SoccerGame::get_scores(@0x123);
        assert!(score1 == 1 && score2 == 0, 0);
    }

    #[test]
    #[expected_failure(abort_code = 6)]
    fun test_score_goal_invalid_team() {
        let admin = create_signer(@0x123);
        timestamp::set_time_has_started_for_testing(&admin);
        SoccerGame::initialize_game(&admin, string::utf8(b"Team A"), string::utf8(b"Team B"));
        SoccerGame::start_game(&admin);
        SoccerGame::score_goal(&admin, string::utf8(b"Team C"));
    }

    #[test]
    fun test_update_time() {
        let admin = create_signer(@0x123);
        timestamp::set_time_has_started_for_testing(&admin);
        SoccerGame::initialize_game(&admin, string::utf8(b"Team A"), string::utf8(b"Team B"));
        SoccerGame::start_game(&admin);
        timestamp::fast_forward_seconds(1000);
        SoccerGame::update_time(&admin);
        assert!(SoccerGame::get_current_time(@0x123) == 1000, 0);
    }

    #[test]
    fun test_end_game() {
        let admin = create_signer(@0x123);
        timestamp::set_time_has_started_for_testing(&admin);
        SoccerGame::initialize_game(&admin, string::utf8(b"Team A"), string::utf8(b"Team B"));
        SoccerGame::start_game(&admin);
        SoccerGame::end_game(&admin);
        assert!(SoccerGame::get_game_status(@0x123) == 2, 0);
    }

    #[test]
    #[expected_failure(abort_code = 5)]
    fun test_end_game_not_in_progress() {
        let admin = create_signer(@0x123);
        SoccerGame::initialize_game(&admin, string::utf8(b"Team A"), string::utf8(b"Team B"));
        SoccerGame::end_game(&admin);
    }

    #[test]
    fun test_game_auto_end() {
        let admin = create_signer(@0x123);
        timestamp::set_time_has_started_for_testing(&admin);
        SoccerGame::initialize_game(&admin, string::utf8(b"Team A"), string::utf8(b"Team B"));
        SoccerGame::start_game(&admin);
        timestamp::fast_forward_seconds(5400); // 90 minutes
        SoccerGame::update_time(&admin);
        assert!(SoccerGame::get_game_status(@0x123) == 2, 0);
    }
}