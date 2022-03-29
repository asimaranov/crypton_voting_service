require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require('solidity-coverage');
require('dotenv').config({path:__dirname+'/.env'})


// npx hardhat run --network rinkeby scripts/deploy.js

module.exports = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {}

  }
};

