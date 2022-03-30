require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require('solidity-coverage');
require('dotenv').config({ path: __dirname + '/.env' })


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

task("deploy", "Deploys contract to network").setAction(async () => {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const VotingService = await ethers.getContractFactory("VotingService");
  const votingService = await VotingService.deploy();

  console.log("Voting service address:", votingService.address);
});

task("addVoting", "Creates a new voting").setAction(async () => {
  const VotingServiceContract = await ethers.getContractFactory("VotingService");
  const votingService = await VotingServiceContract.attach("0x8F412599cA1A1623B0F51f9D78da31af09953b7d");
  const votingTransaction = await votingService.addVoting();
  const rc = await votingTransaction.wait();

  const votingCreatedEvent = rc.events.find(event => event.event === 'VotingCreated');
  const [votingId] = votingCreatedEvent.args;
  console.log(`Your voting id: ${votingId}`);
});

task("withdrawMoney", "Withdraws service money").setAction(async () => {
  const VotingServiceContract = await ethers.getContractFactory("VotingService");
  votingService = await VotingServiceContract.deploy();
  voting = await votingService.withdrawMoney();
  console.log('Money successfully withdrawed');
});

task("vote", "Vote to a specific voting")
  .addParam("votingId", "Voting to vote id")
  .addParam("candidateAddr", "Address of candidate to vote")
  .setAction(async (args) => {
    const VotingServiceContract = await ethers.getContractFactory("VotingService");
    votingService = await VotingServiceContract.deploy();
    voting = await votingService.vote(args['votingId'], args['candidateAddr']);
    console.log('Successfully voted');
  });
