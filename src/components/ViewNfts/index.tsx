import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  getProvider,
  fetchAllNfts,
  handlePurchaseErc20,
  handlePurchaseErc1155,
  handlePurchaseErc20Signature
} from '../../utils/contract';

export const ViewNfts = () => {
  const { address } = useParams<{ address: string }>();
  const [erc20NftCollection, setErc20NftCollection] = useState<any[]>([]);
  const [erc1155NftCollection, setErc1155NftCollection] = useState<any[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [signatureInput, setSignatureInput] = useState<string>('');

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

  const fetchNFTs = useCallback(async () => {
    if (!address || !currentAccount) return;

    try {
      const [nftItems, erc1155Items] = await fetchAllNfts();
      const items = await Promise.all(
        nftItems.map(async (nft: any) => {
          const tokenId = nft[0].toNumber(); // Convert BigNumber to number
          const owner = nft[1];
          const tokenURI = nft[2];
          const paymentToken = nft[3];
          const price = ethers.utils.formatUnits(nft[4].toString(), 'ether'); // Convert BigNumber to string and format as ether
          const signature = nft[5]; // Add signature to fetched data

          const meta = await fetch(tokenURI).then((response) => response.json());
          const status =
            owner.toLowerCase() === currentAccount?.toLowerCase() ? 'sold' : 'available';

          return {
            tokenId: tokenId,
            owner: owner,
            tokenURI: tokenURI,
            paymentTokenAddress: paymentToken,
            price: price,
            imageUrl: meta.image, // Use image URL from metadata
            nftName: meta.name,
            nftDescription: meta.description,
            status: status,
            listingType: 'erc20',
            signature: signature // Include the signature in the returned data
          };
        })
      );

      const erc1155ItemsProcessed = erc1155Items.map((item: any) => ({
        tokenId: item.tokenId.toNumber(),
        owner: item.owner,
        tokenAddress: item.tokenAddress,
        amount: item.amount.toNumber(),
        price: ethers.utils.formatUnits(item.price.toString(), 'ether'),
        listingType: 'erc1155',
        imageUrl: '', // Add your image URL here if you have any, otherwise handle this in the render function
        nftName: 'ERC1155 Token',
        nftDescription: `Amount: ${item.amount}`,
        status: item.owner.toLowerCase() === currentAccount?.toLowerCase() ? 'sold' : 'available'
      }));

      setErc20NftCollection(items);
      setErc1155NftCollection(erc1155ItemsProcessed);
      console.log('NFTs fetched:', items, erc1155ItemsProcessed);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  }, [address, currentAccount]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  const handlePurchase = async (tokenId: number, listingType: string) => {
    try {
      const nft =
        listingType === 'erc20'
          ? erc20NftCollection.find((nft) => nft.tokenId === tokenId)
          : erc1155NftCollection.find((nft) => nft.tokenId === tokenId);

      if (!nft) {
        console.error('NFT not found');
        return;
      }

      console.log('NFT:', nft);
      console.log('Listing Type:', listingType);

      if (listingType === 'erc20') {
        await handlePurchaseErc20(nft.paymentTokenAddress, nft.price, tokenId);
      } else if (listingType === 'erc1155') {
        console.log('ERC1155 Purchase:', nft);
        await handlePurchaseErc1155(nft.price, nft.amount, tokenId);
      }

      alert('NFT purchased successfully!');
      fetchNFTs();
    } catch (error: any) {
      console.error('Error purchasing NFT:', error);

      let message = 'Failed to purchase NFT.';
      if (error?.data?.message) {
        message = error.data.message;
      } else if (error?.message) {
        message = error.message;
      }
      alert(message);
    }
  };

  const handlePurchaseWithSignature = async (tokenId: number, sellerSignature: string) => {
    try {
      const nft = erc20NftCollection.find((nft) => nft.tokenId === tokenId);
      if (!nft) {
        console.error('NFT not found');
        return;
      }

      // Compare the provided buyer signature with the stored seller signature
      if (sellerSignature !== nft.signature) {
        alert('Signature mismatch. Please provide the correct signature.');
        return;
      }

      const transaction = await handlePurchaseErc20Signature(
        nft.price,
        nft.paymentTokenAddress,
        tokenId,
        sellerSignature
      );

      await transaction.wait();
      alert('NFT purchased successfully with signature!');
      fetchNFTs();
    } catch (error: any) {
      console.error('Error purchasing NFT with signature:', error);

      let message = 'Failed to purchase NFT.';
      if (error?.error?.message) {
        message = error.error.message;
      } else if (error?.message) {
        message = error.message;
      }
      alert(message);
    }
  };

  return (
    <div className="App">
      <h1>NFT Collection: {address}</h1>
      <div className="nft-collection">
        {erc20NftCollection.map((nft, index) => (
          <div key={index} className="nft-item">
            <img src={nft.imageUrl} alt={nft.nftName} />
            <div>{nft.nftName}</div>
            <div>{nft.nftDescription}</div>
            <div>{nft.price} Tokens</div>
            {nft.status === 'sold' ? (
              <div>Status: Sold</div>
            ) : (
              <>
                <button onClick={() => handlePurchase(nft.tokenId, nft.listingType)}>
                  Buy NFT
                </button>
                <div>
                  <input
                    type="text"
                    placeholder="Enter Seller's Signature"
                    value={signatureInput}
                    onChange={(e) => setSignatureInput(e.target.value)}
                  />
                  <button onClick={() => handlePurchaseWithSignature(nft.tokenId, signatureInput)}>
                    Buy NFT with Signature
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {erc1155NftCollection.map((nft, index) => (
          <div key={index} className="nft-item">
            <div>{nft.nftName}</div>
            <div>{nft.nftDescription}</div>
            <div>{nft.amount} available</div>
            <div>
              {nft.price} ETH (Total: {(nft.amount * nft.price).toFixed(4)} ETH)
            </div>
            {nft.status === 'sold' ? (
              <div>Status: Sold</div>
            ) : (
              <button onClick={() => handlePurchase(nft.tokenId, nft.listingType)}>Buy NFT</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
