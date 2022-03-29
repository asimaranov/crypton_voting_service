// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract VotingService {
    struct User {
        bool voted;
        address vote;
        uint256 votesForNum;
    }

    struct Voting {
        uint256 endsAt;
        bool finished;
        address payable leader;
        uint256 leaderVotesNum;
        uint256 votingBudget;
        mapping(address => User) voters;
        uint256 votersNum;
    }

    address payable public owner;
    mapping(uint256 => Voting) public votings;
    uint256 votingsNum;

    uint256 serviceBudget;

    constructor() payable {
        owner = payable(msg.sender);
    }

    function addVoting() public returns (uint256 votingId) {
        require(msg.sender == owner, "You're not the owner!");
        votingId = votingsNum;
        Voting storage voting = votings[votingId];
        voting.endsAt = block.timestamp + 3 days;
        votingsNum++;
    }

    function withdrawMoney() public payable {
        require(msg.sender == owner, "You're not the owner!");
        owner.transfer(serviceBudget);
        serviceBudget = 0;
    }

    function vote(uint256 votingId, address payable candidate_addr)
        public
        payable
    {
        require(msg.value == 0.01 ether, "Vote costs 0.01 eth!");
        Voting storage voting = votings[votingId];

        require(!voting.finished, "Voting is finished");

        User storage voter = voting.voters[msg.sender];
        User storage candidate = voting.voters[candidate_addr];
        require(!voter.voted, "You already voted!");

        voter.vote = candidate_addr;
        voter.voted = true;
        candidate.votesForNum++;
        voting.votingBudget += 0.009 ether;
        serviceBudget += 0.001 ether;
        voting.votersNum++;

        if (voting.leaderVotesNum < candidate.votesForNum) {
            voting.leaderVotesNum = candidate.votesForNum;
            voting.leader = candidate_addr;
        }
    }

    function finish(uint256 votingId) public {
        Voting storage voting = votings[votingId];
        
        require(block.timestamp >= voting.endsAt, "Its too early");
        require(!voting.finished, "Voting is finished");

        voting.finished = true;
        voting.leader.transfer(voting.votingBudget);
        voting.votingBudget = 0;
    }
    

    function getVotingsNum() public view returns (uint256) {
        return votingsNum;
    }

    function getVotingFinished(uint256 votingId) public view returns (bool) {
        return votings[votingId].finished;
    }


    function getVotersNum(uint256 votingId) public view returns (uint256) {
        return votings[votingId].votersNum;
    }

    function getLeader(uint256 votingId) public view returns (address) {
        return votings[votingId].leader;
    }


}
