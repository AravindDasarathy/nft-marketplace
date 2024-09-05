import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getCollections, getNftFactoryContract } from '../../utils/contract';

export const ViewCollections = () => {
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const collections = await getCollections();

      setCollections(collections);
    };

    fetchCollections();
  }, [getNftFactoryContract]);

  return (
    <div className="App">
      <h1>Existing Collections</h1>
      <ul>
        {collections.map((address) => (
          <li key={address}>
            <Link to={`/collections/${address}`}>{address}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};