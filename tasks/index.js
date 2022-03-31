const deployedContractAddr = "0x8F412599cA1A1623B0F51f9D78da31af09953b7d";

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
    const votingService = await VotingServiceContract.attach(deployedContractAddr);
    const votingTransaction = await votingService.addVoting();
    const rc = await votingTransaction.wait();
  
    const votingCreatedEvent = rc.events.find(event => event.event === 'VotingCreated');
    const [votingId] = votingCreatedEvent.args;
    console.log(`Your voting id: ${votingId}`);
  });
  
  task("withdrawMoney", "Withdraws service money").setAction(async () => {
    const VotingServiceContract = await ethers.getContractFactory("VotingService");
    const votingService = await VotingServiceContract.attach(deployedContractAddr);
    voting = await votingService.withdrawMoney();
    console.log('Money successfully withdrawed');
  });
  
  task("vote", "Vote to a specific voting")
    .addParam("votingId", "Voting to vote id")
    .addParam("candidateAddr", "Address of candidate to vote")
    .setAction(async (args) => {
      const VotingServiceContract = await ethers.getContractFactory("VotingService");
      const votingService = await VotingServiceContract.attach(deployedContractAddr);
      voting = await votingService.vote(args['votingId'], args['candidateAddr']);
      console.log('Successfully voted');
    });
  

    task("finish", "Vote to a specific voting")
    .addParam("votingId", "Voting to vote id")
    .setAction(async (args) => {
      const VotingServiceContract = await ethers.getContractFactory("VotingService");
      const votingService = await VotingServiceContract.attach(deployedContractAddr);
      voting = await votingService.finish(args['votingId']);
      console.log('Successfully finished');
    });