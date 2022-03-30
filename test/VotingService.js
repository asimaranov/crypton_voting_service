const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingServiceContract", function () {

    let VotingServiceContract;
    let votingService;
    let votingId;
    let owner;
    let user1;
    let user2;
    let users;

    beforeEach(async function () {
        VotingServiceContract = await ethers.getContractFactory("VotingService");
        [owner, user1, user2, ...users] = await ethers.getSigners();
        votingService = await VotingServiceContract.deploy();
        const votingTransaction = await votingService.addVoting();
        const rc = await votingTransaction.wait();

        const votingCreatedEvent = rc.events.find(event => event.event === 'VotingCreated');
        [votingId] = votingCreatedEvent.args;

    })

    describe("Deployment", function () {
        it("Check owner", async function () {
            expect(await votingService.owner()).to.equal(owner.address)
        })
    });

    describe("Voting", async function () {
        it("Check unique voting id", async function () {
            const voting2Transaction = await votingService.addVoting();
            const rc2 = await voting2Transaction.wait();
    
            const voting2CreatedEvent = rc2.events.find(event => event.event === 'VotingCreated');
            const [voting2Id] = voting2CreatedEvent.args;
    
            await expect(voting2Id).to.equal(1);
        });
        it("Check that only owner can create a new voting", async function () {
            await expect(votingService.connect(user1).addVoting()).to.be.revertedWith("You're not the owner!");
        });


        it("Check initializated state", async function () {

            await expect(votingId).to.equal(0);
            await expect(await votingService.getVotersNum(votingId)).to.equal(0);
            await expect(await votingService.getVotingFinished(votingId)).to.equal(false);
        });

        it("Check that free vote is impossible", async function () {

            await expect(votingService.connect(user1).vote(votingId, user2.address)).to.be.revertedWith("Vote costs 0.01 eth!");
        })


        it("Check new state after voting", async function () {

            await votingService.connect(user1).vote(votingId, user2.address, { value: ethers.utils.parseEther("0.01") });

            expect(await votingService.getVotingsNum()).to.equal(1);
            expect(await votingService.getVotersNum(votingId)).to.equal(1);
            expect(await votingService.getLeader(votingId)).to.equal(user2.address);
            expect(await votingService.getVotingFinished(votingId)).to.equal(false);
        });

        it("Check that double vote is prohibited", async function () {
            await votingService.connect(user1).vote(votingId, user2.address, { value: ethers.utils.parseEther("0.01") });
            await expect(votingService.connect(user1).vote(votingId, user2.address, { value: ethers.utils.parseEther("0.01") })).to.be.revertedWith("You already voted!");
        });


        it("Check leader choosing", async function () {

            for (let i = 0; i < 5; i++) {
                await votingService.connect(users[i]).vote(votingId, user1.address, { value: ethers.utils.parseEther("0.01") });
            }

            for (let i = 5; i < 15; i++) {
                await votingService.connect(users[i]).vote(votingId, user2.address, { value: ethers.utils.parseEther("0.01") });
            }

            for (let i = 15; i < 17; i++) {
                await votingService.connect(users[i]).vote(votingId, users[0].address, { value: ethers.utils.parseEther("0.01") });
            }

            expect(await votingService.getLeader(votingId)).to.equal(user2.address);  // The winner is determined correctly
            expect(await votingService.getVotersNum(votingId)).to.equal(17);  // Voters num is correct 

        });

        it("Check early finish", async function () {
            await expect(votingService.finish(votingId)).to.be.revertedWith('Its too early');
        });

        it("Check in-time finish", async function () {
            await votingService.connect(user1).vote(votingId, user2.address, { value: ethers.utils.parseEther("0.01") }); // Some user vote

            await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // Add 3 days

            await expect(await votingService.getVotingFinished(votingId)).to.equal(false);  // Voting is not finished now

            const leaderInitialBalance = await user1.getBalance();

            await votingService.finish(votingId);

            await expect(await user1.getBalance() > leaderInitialBalance); // Money has been successfully transferred to the leader
            await expect(await votingService.getVotingFinished(votingId)).to.equal(true);  // And voting is finished

        });

        it("Check withdraw attempt not by owner", async function () {
            await expect(votingService.connect(user1).withdrawMoney()).to.be.revertedWith("You're not the owner!");
        });

        it("Check withdraw by owner", async function () {
            const owner_initial_balance = await owner.getBalance();

            await votingService.connect(user1).vote(votingId, user2.address, { value: ethers.utils.parseEther("0.01") }); // Some user vote

            await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // Add 3 days
            expect(await votingService.getVotingFinished(votingId)).to.equal(false);
            await votingService.finish(votingId);

            await votingService.withdrawMoney();

            await expect(await owner.getBalance() > owner_initial_balance);

        });

        it("Check impossibility to vote after", async function () {
            await votingService.connect(user1).vote(votingId, user2.address, { value: ethers.utils.parseEther("0.01") }); // Some user vote
            await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // Add 3 days
            await votingService.finish(votingId);
            await expect(votingService.connect(user2).vote(votingId, user2.address, { value: ethers.utils.parseEther("0.01") })).to.be.revertedWith("Voting is finished");
            await expect(await votingService.getVotingFinished(votingId)).to.equal(true);

        });

        it("Check double finish", async function () {
            await votingService.connect(user1).vote(votingId, user2.address, { value: ethers.utils.parseEther("0.01") }); // Some user vote
            await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // Add 3 days
            await votingService.finish(votingId);

            expect(votingService.finish(votingId)).to.be.revertedWith("Voting is finished");
        });


    });
});
