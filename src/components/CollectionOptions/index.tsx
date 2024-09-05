import React from 'react';
import { Link, useParams } from 'react-router-dom';

export const CollectionOptions = () => {
  const { address } = useParams();

  return (
    <div className="App">
      <h1>Collection: {address}</h1>
      <nav>
        <ul>
          <li>
            <Link to={`/collections/${address}/list-nft`}>List NFT</Link>
          </li>
          <li>
            <Link to={`/collections/${address}/view-nfts`}>View NFTs</Link>
          </li>
          <li>
            <Link to={`/collections/${address}/proposals`}>Governance Proposals</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};