// View Controller - Handles all DOM manipulation and user interactions
class VotingViewController {
    constructor() {
        this.selectedCandidateId = null;
        this.currentVoterId = null;
        this.initializeEventListeners();
        this.loadInitialData();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Candidate management
        document.getElementById('add-candidate-btn').addEventListener('click', () => this.addCandidate());
        document.getElementById('candidate-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCandidate();
        });

        // Voter registration
        document.getElementById('register-voter-btn').addEventListener('click', () => this.registerVoter());
        document.getElementById('voter-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.registerVoter();
        });

        // Voting
        document.getElementById('load-voting-btn').addEventListener('click', () => this.loadVotingOptions());
        document.getElementById('submit-vote-btn').addEventListener('click', () => this.submitVote());
        
        // Results
        document.getElementById('load-results-btn').addEventListener('click', () => this.loadResults());
    }

    // Load initial data when page loads
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadCandidates(),
                this.loadVoters(),
                this.loadVoterLists()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Candidate management methods
    async addCandidate() {
        const candidateName = document.getElementById('candidate-name').value.trim();
        if (!candidateName) {
            votingAPI.showStatus('Please enter a candidate name', 'error');
            return;
        }

        try {
            await votingAPI.createCandidate(candidateName);
            document.getElementById('candidate-name').value = '';
            await this.loadCandidates();
        } catch (error) {
            console.error('Error adding candidate:', error);
        }
    }

    async loadCandidates() {
        try {
            const candidates = await votingAPI.getCandidates();
            this.renderCandidates(candidates);
        } catch (error) {
            console.error('Error loading candidates:', error);
        }
    }

    renderCandidates(candidates) {
        const container = document.getElementById('candidates-list');
        
        if (candidates.length === 0) {
            container.innerHTML = '<div class="empty-state">No candidates added yet</div>';
            return;
        }

        container.innerHTML = candidates.map(candidate => `
            <div class="candidate-item">
                <span class="item-name">${candidate.candidateName}</span>
                <div class="item-actions">
                    <button class="delete-btn" onclick="votingController.deleteCandidate('${candidate._id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async deleteCandidate(candidateId) {
        if (!confirm('Are you sure you want to delete this candidate? This will also delete all votes for this candidate.')) {
            return;
        }

        try {
            await votingAPI.deleteCandidate(candidateId);
            await this.loadCandidates();
            await this.loadVoterLists(); // Refresh voter lists in case votes were deleted
        } catch (error) {
            console.error('Error deleting candidate:', error);
        }
    }

    // Voter management methods
    async registerVoter() {
        const voterName = document.getElementById('voter-name').value.trim();
        if (!voterName) {
            votingAPI.showStatus('Please enter your name', 'error');
            return;
        }

        try {
            await votingAPI.createVoter(voterName);
            document.getElementById('voter-name').value = '';
            await this.loadVoters();
            await this.loadVoterLists();
        } catch (error) {
            console.error('Error registering voter:', error);
        }
    }

    async loadVoters() {
        try {
            const voters = await votingAPI.getVoters();
            this.renderVoterSelect(voters);
        } catch (error) {
            console.error('Error loading voters:', error);
        }
    }

    async renderVoterSelect(voters) {
        const select = document.getElementById('voter-select');

        const voterStatus = await this.getVotersWithStatus();

        select.innerHTML = '<option value="">Select a voter</option>' +
            voters.map(voter => {
                const hasVoted = voterStatus.voted.some(votedVoter => 
                    votedVoter._id.toString() === voter._id.toString()
                );
                if (hasVoted) {
                    return `<option value="${voter._id}" disabled>
                        ${voter.voterName} (Already Voted)
                    </option>`;
                } else {
                    return `<option value="${voter._id}">
                        ${voter.voterName}
                    </option>`;
                }
            }).join('');
    }

    // Voting methods
    async loadVotingOptions() {
        const voterId = document.getElementById('voter-select').value;
        if (!voterId) {
            votingAPI.showStatus('Please select a voter first', 'error');
            return;
        }
    
        this.currentVoterId = voterId;
    
        try {
            // Just load candidates - don't check for existing ballot
            const candidates = await votingAPI.getCandidates();
            if (candidates.length === 0) {
                votingAPI.showStatus('No candidates available for voting', 'error');
                return;
            }
    
            this.renderVotingOptions(candidates);
            document.getElementById('voting-options').style.display = 'block';
        } catch (error) {
            console.error('Error loading voting options:', error);
            votingAPI.showStatus('Error loading voting options', 'error');
        }
    }

    renderVotingOptions(candidates) {
        const container = document.getElementById('candidate-options');
        container.innerHTML = candidates.map(candidate => `
            <div class="candidate-option" onclick="votingController.selectCandidate('${candidate._id}')">
                <input type="radio" name="candidate" value="${candidate._id}" id="candidate-${candidate._id}">
                <label for="candidate-${candidate._id}">${candidate.candidateName}</label>
            </div>
        `).join('');

        document.getElementById('submit-vote-btn').style.display = 'none';
        this.selectedCandidateId = null;
    }

    selectCandidate(candidateId) {
        // Remove previous selection
        document.querySelectorAll('.candidate-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selection to clicked option
        event.currentTarget.classList.add('selected');
        event.currentTarget.querySelector('input[type="radio"]').checked = true;

        this.selectedCandidateId = candidateId;
        document.getElementById('submit-vote-btn').style.display = 'block';
    }

    async submitVote() {
        if (!this.selectedCandidateId || !this.currentVoterId) {
            votingAPI.showStatus('Please select a candidate', 'error');
            return;
        }

        try {
            await votingAPI.submitVote(this.currentVoterId, this.selectedCandidateId);
            document.getElementById('voting-options').style.display = 'none';
            await this.loadVoterLists();
        } catch (error) {
            console.error('Error submitting vote:', error);
        }
    }

    // Voter lists methods
    async loadVoterLists() {
        try {
            const voterStatus = await votingAPI.getVotersWithStatus();
            this.renderVoterLists(voterStatus);
        } catch (error) {
            console.error('Error loading voter lists:', error);
        }
    }

    async getVotersWithStatus() {
        try {
            const voters = await votingAPI.getVoters();
            const results = await votingAPI.getVotingResults();
            
            // Create a map of voter IDs who have voted
            const votedVoterIds = new Set();
            // We need to get ballots to know which voters have voted
            // For now, we'll use a different approach - check each voter individually
            const votedVoters = [];
            const notVotedVoters = [];

            for (const voter of voters) {
                try {
                    const ballot = await votingAPI.getVoterBallot(voter._id);
                    if (ballot) {
                        votedVoters.push(voter);
                    } else {
                        notVotedVoters.push(voter);
                    }
                } catch (error) {
                    // If ballot doesn't exist, voter hasn't voted
                    notVotedVoters.push(voter);
                }
            }

            return {
                notVoted: notVotedVoters,
                voted: votedVoters
            };
        } catch (error) {
            console.error('Error getting voter status:', error);
            return { notVoted: [], voted: [] };
        }
    }

    renderVoterLists(voterStatus) {
        // Not voted voters
        const notVotedContainer = document.getElementById('not-voted-list');
        if (voterStatus.notVoted.length === 0) {
            notVotedContainer.innerHTML = '<div class="empty-state">All voters have voted!</div>';
        } else {
            notVotedContainer.innerHTML = voterStatus.notVoted.map(voter => `
                <div class="voter-item">
                    <span class="item-name">${voter.voterName}</span>
                    <div class="item-actions">
                        <button class="delete-btn" onclick="votingController.deleteVoter('${voter._id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Voted voters
        const votedContainer = document.getElementById('voted-list');
        if (voterStatus.voted.length === 0) {
            votedContainer.innerHTML = '<div class="empty-state">No votes cast yet</div>';
        } else {
            votedContainer.innerHTML = voterStatus.voted.map(voter => `
                <div class="voter-item voted">
                    <span class="item-name">${voter.voterName}</span>
                    <div class="item-actions">
                        <button class="delete-btn" onclick="votingController.deleteVoter('${voter._id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    async deleteVoter(voterId) {
        if (!confirm('Are you sure you want to delete this voter? This will also delete their vote if they have voted.')) {
            return;
        }

        try {
            await votingAPI.deleteVoter(voterId);
            await this.loadVoters();
            await this.loadVoterLists();
        } catch (error) {
            console.error('Error deleting voter:', error);
        }
    }

    // Results methods
    async loadResults() {
        try {
            const results = await votingAPI.getVotingResults();
            this.renderResults(results);
        } catch (error) {
            console.error('Error loading results:', error);
        }
    }

    renderResults(results) {
        const container = document.getElementById('results-content');
        
        if (results.length === 0) {
            container.innerHTML = '<div class="empty-state">No voting results available</div>';
            return;
        }

        // Sort results by vote count (descending)
        results.sort((a, b) => b.votes - a.votes);
        
        const maxVotes = Math.max(...results.map(r => r.votes));
        const winners = results.filter(r => r.votes === maxVotes && maxVotes > 0);

        container.innerHTML = results.map(result => `
            <div class="results-item ${winners.includes(result) ? 'winner' : ''}">
                <span class="candidate-name">${result.candidateName}:</span>
                <span class="vote-count ${winners.includes(result) ? 'winner' : ''}">
                    ${result.votes}
                </span>
            </div>
        `).join('');

        if (winners.length > 0 && maxVotes > 0) {
            const winnerNames = winners.map(w => w.candidateName).join(', ');
            votingAPI.showStatus(`Winner${winners.length > 1 ? 's' : ''}: ${winnerNames}`, 'success');
        }
    }
}

// Initialize the view controller when the page loads
let votingController;
document.addEventListener('DOMContentLoaded', () => {
    votingController = new VotingViewController();
});
