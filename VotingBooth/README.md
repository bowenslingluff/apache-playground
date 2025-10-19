**Voting Booth Application Design**

**API:**

/voter
- GET 
  - returns a list of voters
- POST 
  - register as a voter
  - *request body*: { "voterName": "John Doe" }
    - name of voter registering

/voter/{voterId}
- PUT 
  - updates a voter's name
  - *request body*: { "voterName": "John Doe" }
    - new name of voter
- DELETE 
  - removes a voter

/voter/{voterId}/ballot
- GET 
  - returns the candidateID voter for by voterId
- POST 
  - submit a vote
  - *request body*: { "candidateId": "123" }
    - ID of candidate voted for
- PUT
  - change a vote for a voter
  - *request body*: { "candidateId": "123" }
    - ID of candidate voted for
- DELETE 
  - deletes the voter's ballot

/candidates
- GET 
  - returns a list of candidates
- POST
  - add a new candidate
  - *request body*: { "candidateName": "John Doe" }
    - name of candidate being added

/candidates/{candidateId}
- DELETE
  - removes a candidate

/candidates/ballots

- GET 
  - returns a list of candidates with number of votes for each candidate
    - list contains *pending* object for candidates without votes

**MongoDB Collections:**

Voters
- _id
- voterName

Candidates
- _id
- candidateName

Ballots
- _id
- voterId
- candidateId
