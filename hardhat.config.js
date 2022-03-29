require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require('solidity-coverage');
require('dotenv').config({path:__dirname+'/.env'})



module.exports = {
  solidity: "0.7.3",
  defaultNetwork: "rinkeby",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

