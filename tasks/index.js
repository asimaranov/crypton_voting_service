const deployedContractAddr = "0x0598daB4aA55067829dC440266133AfD72c38a49";

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


task("votingStats", "Shows the statistics of a specific voting")
    .addParam("votingId", "Voting to vote id")
    .setAction(async (args) => {
        const VotingServiceContract = await ethers.getContractFactory("VotingService");
        const votingService = await VotingServiceContract.attach(deployedContractAddr);
        const leader = await votingService.getLeader(args['votingId']);
        const votersNum = await votingService.getVotersNum(args['votingId']);
        const isFinished = await votingService.getVotingFinished(args['votingId']);
        const getVotingDedline = await votingService.getVotingDedline(args['votingId']);
        const endsAtDate = new Date(getVotingDedline * 1000);

        console.log(`Voting stats:\nVoters num: ${votersNum}\nLeader: ${leader}\nIs finished: ${isFinished}\nActive until: ${endsAtDate}`);
    });