import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { pinFileToIPFS, pinMetadataToIPFS } from '../../utils/pinata';
import { createGovernancePropsoal, createNft, getNftFactoryContract, getSigner, listErc1155, signMessage } from '../../utils/contract';
import { NftForm } from '..';


export const ListNft = () => {
  const { address } = useParams();
  const [nftCollection, setNftCollection] = useState<any[]>([]);

  const handleSubmit = async (values: any) => {
    try {
      console.log('Start uploading image to Pinata');

      const imageRes = await pinFileToIPFS(values.imageContent);
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageRes.data.IpfsHash}`;

      console.log('Image uploaded to IPFS:', imageUrl);

      const metadata = {
        name: values.nftName,
        description: values.nftDescription,
        image: imageUrl,
      };

      const metadataRes = await pinMetadataToIPFS(metadata);
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataRes.data.IpfsHash}`;

      console.log('Metadata uploaded to IPFS:', metadataUrl);

      const contract = getNftFactoryContract();

      console.log('Calling createNFT with Metadata URL:', metadataUrl);

      let transaction;
      if (values.listingType === 'erc20') {
        transaction = await createNft(metadataUrl, values.paymentTokenAddress, values.price);
      } else if (values.listingType === 'erc1155') {
        transaction = await listErc1155(values.erc1155TokenAddress, values.tokenId, values.amount, values.price);
      } else if (values.listingType === 'signature') {
        const signObj = await signMessage(metadataUrl, values.paymentTokenAddress, values.price);
        const signature = signObj.signature;
        transaction = signObj.listNftSignature;

        const newNftItem: any = {
          ...values,
          status: 'available',
          tokenId: transaction.tokenId,
          owner: await getSigner().getAddress(),
          signature: signature, // Ensure to store the signature
        };

        setNftCollection([...nftCollection, newNftItem]);
      } else if (values.listingType === 'governance') {
        transaction = await createGovernancePropsoal(metadataUrl, values.paymentTokenAddress, values.price);

        alert('Governance proposal created successfully!');
      }

      const receipt = await transaction.wait();

      console.log('Transaction successful:', transaction.hash);

      const tokenId = receipt.events && receipt.events[0] && receipt.events[0].args && receipt.events[0].args.tokenId
        ? receipt.events[0].args.tokenId.toNumber()
        : values.tokenId;

      const newNftItem: any = {
        ...values,
        status: 'available',
        tokenId: tokenId,
        owner: await getSigner().getAddress(),
      };

      setNftCollection([...nftCollection, newNftItem]);

      alert('Image and metadata uploaded, and NFT created successfully!');
    } catch (error: any) {
      console.error('Error uploading file:', error);

      let message = 'Failed to upload image or create NFT.';
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
      <h1>List a new NFT</h1>
      <NftForm onSubmit={handleSubmit} />
    </div>
  );
};