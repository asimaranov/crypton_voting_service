const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingServiceContract", function () {

    let VotingServiceContract;
    let votingService;
    let owner;
    let user1;
    let user2;
    let users;

    beforeEach(async function () {
        VotingServiceContract = await ethers.getContractFactory("VotingService");
        [owner, user1, user2, ...users] = await ethers.getSigners();
        votingService = await VotingServiceContract.deploy();

    })

    describe("Deployment", function () {

        it("Check owner", async function () {
            expect(await votingService.owner()).to.equal(owner.address)
        })
    });

    it("Voting", async function () {
    
        await expect(votingService.connect(user1).addVoting()).to.be.revertedWith("You're not the owner!");

        const voting = await votingService.addVoting();

        expect(voting.value).to.equal(0);
        expect(await votingService.getVotersNum(voting.value)).to.equal(0);
        expect(await votingService.getVotingFinished(voting.value)).to.equal(false);

        await expect(votingService.connect(user1).vote(voting.value, user2.address)).to.be.revertedWith("Vote costs 0.01 eth!");

        await votingService.connect(user1).vote(voting.value, user2.address, { value: ethers.utils.parseEther("0.01")});

        expect(await votingService.getVotingsNum()).to.equal(1);
        expect(await votingService.getVotersNum(voting.value)).to.equal(1);
        expect(await votingService.getLeader(voting.value)).to.equal(user2.address);
        expect(await votingService.getVotingFinished(voting.value)).to.equal(false);

        await expect(votingService.connect(user1).vote(voting.value, user2.address, { value: ethers.utils.parseEther("0.01")})).to.be.revertedWith("You already voted!");

        

        await expect( votingService.finish(voting.value)).to.be.revertedWith('Its too early');

        await network.provider.send("evm_increaseTime", [60*60*24*3]);

        expect(await votingService.getVotingFinished(voting.value)).to.equal(false);

        console.log(await votingService.finish(voting.value));

        await expect(votingService.connect(user1).withdrawMoney()).to.be.revertedWith("You're not the owner!");

        await votingService.withdrawMoney();

        await expect(votingService.connect(user2).vote(voting.value, user2.address, { value: ethers.utils.parseEther("0.01")})).to.be.revertedWith("Voting is finished");
        expect(await votingService.getVotingFinished(voting.value)).to.equal(true);
        expect(votingService.finish(voting.value)).to.be.revertedWith("Voting is finished");


        
    });
});
