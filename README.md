# Kobe

## Presentation

[Kobe - Presentation](https://www.figma.com/deck/LUxodILMvAjbpITukwxaRx/Kobe-Deck-Aptos?node-id=1-305&node-type=slide&t=nS3TruYXqnd8nLVD-0&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1)


## Description

Kobe is an advanced tool designed to facilitate development on the Aptos blockchain, powered by Large Language Models (LLMs). This assistant provides an intuitive interface for developers to interact with intelligent models, efficiently generate and deploy smart contracts, and get the latest updates from the blockchain space.

With Kobe, anyone can automate the creation and development of a smart contract, from generation to deployment on Aptos, all within one environment.

## Features

- **Smart Contract Generation**: Automatically generates contracts for Aptos using artificial intelligence.
- **Testing and Validation**: Validates and tests the generated smart contracts before deployment.
- **Compilation and Deployment**: Compiles and deploys contracts directly onto the Aptos blockchain from the tool.
- **Real-Time Information**: Access the latest blockchain updates through Retrieval-Augmented Generation (RAG) technologies, ensuring you're always up-to-date.

## Installation

To generate, compile, and deploy contracts on the Aptos blockchain using Kobe, follow these steps:

### Prerequisites for using Kobe

Make sure you have the following tools installed on your system:

1. **Node.js and npm**: Kobe uses npm to handle frontend dependencies.
   - Install Node.js and npm from [here](https://nodejs.org/en/download/), or with a package manager like `nvm`:
     ```bash
     nvm install node
     ```

2. **Aptos CLI**: Required to interact with the Aptos blockchain, including compiling and deploying Move contracts.
   - Install Aptos CLI by running:
     ```bash
     curl -sSf https://aptos.dev/tools/install-cli | sh
     ```
You can check here depending on your operating system: 
[Aptos CLI - download](https://aptos.dev/en/build/cli)

3. **Move**: Ensure that the Move compiler is available in your environment.
   - Move is part of the Aptos CLI, but you can verify its installation with:
     ```bash
     aptos move --version
     ```
For more information about Move, feel free to check this tutorial: 
[Move - Tutorial](https://github.com/aptos-labs/aptos-core/tree/main/aptos-move/move-examples/move-tutorial)

4. **Aptos Framework**: In case the Aptos Framework link in [Move.toml - File](https://github.com/Teo2423/KobeAptos2/blob/main/Kobe/backend/aptosBranch/Move.toml) doesn’t work. Download it and replace it with the local file path as follows: AptosFramework = { local = "path/to/local/file" }.

## API Keys

Kobe is powered by large language models (LLMs). Therefore, it is necessary to provide the API keys for the services we use to access these capabilities (Claude-Anthropic and GPT-OpenAI).

Below is a list of the files where you must input your own API keys to generate, compile, and deploy your contracts on Aptos:

- `backend/aptosBranch/claudeApi.js` on the first line: const ANTHROPIC_API_KEY = "";
- `backend/aptosBranch/main.js` on line 8: const apiKey = "";
- `backend/ragBranch/index.js` on lines 10 and 12, fill in the API Keys for Supabase and OpenAI, respectively.

Please make sure to add the keys correctly in these files before running the project to ensure that Kobe works optimally.

## External Resources

This project leverages the power of the Aptos blockchain to generate, compile, and deploy smart contracts using the Move language quickly, securely, and efficiently.

## User Conversations Data

We are committed to protecting user data. All information generated in conversations is handled securely and will never be shared.
