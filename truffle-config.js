const HDWalletProvider = require("@truffle/hdwallet-provider")
const RPC_URL = "https://api.baobab.klaytn.net:8651/"
const PRIVATE_KEY = "0x9bd8e94d3edc022a6d2b5d3e2fb6b55e1d300c72748dfb99db451cd885315373"
const NETWORK_ID = "1001"

module.exports = {
	networks: {
		    //   development: {
			//             host: "127.0.0.1",  
			//             port: 8545,      
			//             network_id: "*",   
			//           },
		baobab: {
			provider: new HDWalletProvider(PRIVATE_KEY, RPC_URL),
			network_id: NETWORK_ID,
			from: "0xdd6e0b6d3c71c0a43a6ea2cedf91e1e48e194ea6",
			gas: '8500000',
			gasPrice: null,
		},
	}
};

