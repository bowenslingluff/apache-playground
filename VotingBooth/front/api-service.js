// API Service Layer - Handles all communication with the backend
class VotingAPI {
    constructor() {
        this.baseURL = '/votingbooth';
    }

    // Helper method to handle API responses
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    // Helper method to show status messages
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status-message');
        statusEl.textContent = message;
        statusEl.className = `status-message show ${type}`;
        
        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 3000);
    }

    // Voter API methods
    async getVoters() {
        try {
            const response = await fetch(`${this.baseURL}/voter`);
            return await this.handleResponse(response);
        } catch (error) {
            this.showStatus(`Error fetching voters: ${error.message}`, 'error');
            throw error;
        }
    }

    async createVoter(voterName) {
        try {
            const response = await fetch(`${this.baseURL}/voter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ voterName })
            });
            const result = await this.handleResponse(response);
            this.showStatus(`Voter "${voterName}" registered successfully!`, 'success');
            return result;
        } catch (error) {
            this.showStatus(`Error registering voter: ${error.message}`, 'error');
            throw error;
        }
    }

    async updateVoter(voterId, voterName) {
        try {
            const response = await fetch(`${this.baseURL}/voter/${voterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ voterName })
            });
            const result = await this.handleResponse(response);
            this.showStatus(`Voter updated successfully!`, 'success');
            return result;
        } catch (error) {
            this.showStatus(`Error updating voter: ${error.message}`, 'error');
            throw error;
        }
    }

    async deleteVoter(voterId) {
        try {
            const response = await fetch(`${this.baseURL}/voter/${voterId}`, {
                method: 'DELETE'
            });
            await this.handleResponse(response);
            this.showStatus(`Voter deleted successfully!`, 'success');
        } catch (error) {
            this.showStatus(`Error deleting voter: ${error.message}`, 'error');
            throw error;
        }
    }

    // Ballot API methods
    async getVoterBallot(voterId) {
        try {
            const response = await fetch(`${this.baseURL}/voter/${voterId}/ballot`);
            return await this.handleResponse(response);
        } catch (error) {
            if (error.message.includes('404') || error.message.includes('No ballot found')) {
                return null; // No ballot found - this is normal for new voters
            }
            this.showStatus(`Error fetching ballot: ${error.message}`, 'error');
            throw error;
        }
    }

    async submitVote(voterId, candidateId) {
        try {
            const response = await fetch(`${this.baseURL}/voter/${voterId}/ballot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ candidateId })
            });
            const result = await this.handleResponse(response);
            this.showStatus(`Vote submitted successfully!`, 'success');
            return result;
        } catch (error) {
            this.showStatus(`Error submitting vote: ${error.message}`, 'error');
            throw error;
        }
    }

    async updateVote(voterId, candidateId) {
        try {
            const response = await fetch(`${this.baseURL}/voter/${voterId}/ballot`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ candidateId })
            });
            const result = await this.handleResponse(response);
            this.showStatus(`Vote updated successfully!`, 'success');
            return result;
        } catch (error) {
            this.showStatus(`Error updating vote: ${error.message}`, 'error');
            throw error;
        }
    }

    async deleteVote(voterId) {
        try {
            const response = await fetch(`${this.baseURL}/voter/${voterId}/ballot`, {
                method: 'DELETE'
            });
            await this.handleResponse(response);
            this.showStatus(`Vote deleted successfully!`, 'success');
        } catch (error) {
            this.showStatus(`Error deleting vote: ${error.message}`, 'error');
            throw error;
        }
    }

    // Candidate API methods
    async getCandidates() {
        try {
            const response = await fetch(`${this.baseURL}/candidates`);
            return await this.handleResponse(response);
        } catch (error) {
            this.showStatus(`Error fetching candidates: ${error.message}`, 'error');
            throw error;
        }
    }

    async createCandidate(candidateName) {
        try {
            const response = await fetch(`${this.baseURL}/candidates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ candidateName })
            });
            const result = await this.handleResponse(response);
            this.showStatus(`Candidate "${candidateName}" added successfully!`, 'success');
            return result;
        } catch (error) {
            this.showStatus(`Error adding candidate: ${error.message}`, 'error');
            throw error;
        }
    }

    async deleteCandidate(candidateId) {
        try {
            const response = await fetch(`${this.baseURL}/candidates/${candidateId}`, {
                method: 'DELETE'
            });
            await this.handleResponse(response);
            this.showStatus(`Candidate deleted successfully!`, 'success');
        } catch (error) {
            this.showStatus(`Error deleting candidate: ${error.message}`, 'error');
            throw error;
        }
    }

    // Results API method
    async getVotingResults() {
        try {
            const response = await fetch(`${this.baseURL}/candidates/ballots`);
            return await this.handleResponse(response);
        } catch (error) {
            this.showStatus(`Error fetching results: ${error.message}`, 'error');
            throw error;
        }
    }

    // Utility method to get voters with their voting status
    async getVotersWithStatus() {
        try {
            const voters = await this.getVoters();
            const votedVoters = [];
            const notVotedVoters = [];

            // Check each voter individually to see if they have voted
            for (const voter of voters) {
                try {
                    const ballot = await this.getVoterBallot(voter._id);
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
                allVoters: voters,
                notVoted: notVotedVoters,
                voted: votedVoters
            };
        } catch (error) {
            this.showStatus(`Error fetching voter status: ${error.message}`, 'error');
            throw error;
        }
    }
}

// Create a global instance
const votingAPI = new VotingAPI();
