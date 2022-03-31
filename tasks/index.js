const deployedContractAddr = "0x58AA9D90540f77e93622b6080246DDFfb538AC17";

task("deploy", "Deploys contract to network").setAction(async () => {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const VotingService = await ethers.getContractFactory("VotingService");
    const votingService = await VotingService.deploy();

    console.log(`Voting service address: ${votingService.address}`,);
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
    const transaction = await votingService.withdrawMoney();
    await transaction.wait();
    console.log('Money successfully withdrawed');
});

task("vote", "Vote to a specific voting")
    .addParam("votingId", "Voting to vote id")
    .addParam("candidateAddr", "Address of candidate to vote")
    .setAction(async (args) => {
        const VotingServiceContract = await ethers.getContractFactory("VotingService");
        const votingService = await VotingServiceContract.attach(deployedContractAddr);
        const transaction = await votingService.vote(args['votingId'], args['candidateAddr'], { value: ethers.utils.parseEther("0.01") });
        await transaction.wait();
        console.log(`Successfully voted`);
    });


task("finish", "Vote to the specific voting")
    .addParam("votingId", "Voting to vote id")
    .setAction(async (args) => {
        const VotingServiceContract = await ethers.getContractFactory("VotingService");
        const votingService = await VotingServiceContract.attach(deployedContractAddr);
        const transaction = await votingService.finish(args['votingId']);
        await transaction.wait();
        console.log('Successfully finished');
    });

task("getLeader", "Shows the leader of a specific voting")
    .addParam("votingId", "Voting to vote id")
    .setAction(async (args) => {
        const VotingServiceContract = await ethers.getContractFactory("VotingService");
        const votingService = await VotingServiceContract.attach(deployedContractAddr);
        const leader = await votingService.getLeader(args['votingId']);
        console.log(`Voting leader: ${leader}`);
    });