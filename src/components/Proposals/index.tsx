import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  executeProposal,
  getProposal,
  getProposalCounter,
  getProvider,
  voteOnProposal
} from '../../utils/contract';

export const Proposals = () => {
  const { address } = useParams<{ address: string }>();
  const [proposals, setProposals] = useState<any[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      // Get current account
      try {
        const accounts = await getProvider().send('eth_requestAccounts', []);
        setCurrentAccount(accounts[0]);
      } catch (error) {
        console.error('Error fetching current account:', error);
      }
    };

    if (address) {
      initializeContract();
    }
  }, [address, getProvider]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!address || !currentAccount) return;

      try {
        const proposalCount = await getProposalCounter();
        const fetchedProposals = [];

        for (let i = 0; i < proposalCount; i++) {
          const proposal = await getProposal(i);

          fetchedProposals.push({
            id: proposal.id.toNumber(),
            tokenURI: proposal.tokenURI,
            paymentToken: proposal.paymentToken,
            price: ethers.utils.formatUnits(proposal.price.toString(), 'ether'),
            votes: proposal.votes.toNumber(),
            executed: proposal.executed
          });
        }

        setProposals(fetchedProposals);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
    };

    fetchProposals();
  }, [address, currentAccount]);

  const handleVote = async (proposalId: number) => {
    try {
      const transaction = await voteOnProposal(proposalId);
      await transaction.wait();
      alert('Voted successfully!');
    } catch (error: any) {
      console.error('Error voting on proposal:', error);
      alert('Failed to vote on proposal.');
    }
  };

  const handleExecute = async (proposalId: number) => {
    try {
      const transaction = await executeProposal(proposalId);
      await transaction.wait();
      alert('Proposal executed successfully!');
    } catch (error: any) {
      console.error('Error executing proposal:', error);
      alert('Failed to execute proposal.');
    }
  };

  return (
    <div className="App">
      <h1>Governance Proposals</h1>
      <div className="proposal-list">
        {proposals.map((proposal, index) => (
          <div key={index} className="proposal-item">
            <div>Proposal ID: {proposal.id}</div>
            <div>Token URI: {proposal.tokenURI}</div>
            <div>Payment Token: {proposal.paymentToken}</div>
            <div>Price: {proposal.price} ETH</div>
            <div>Votes: {proposal.votes}</div>
            <div>Status: {proposal.executed ? 'Executed' : 'Pending'}</div>
            <button onClick={() => handleVote(proposal.id)} disabled={proposal.executed}>
              Vote
            </button>
            <button onClick={() => handleExecute(proposal.id)} disabled={proposal.executed}>
              Execute
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
