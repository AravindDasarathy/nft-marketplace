import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createCollection } from '../../utils/contract';

export const CreateCollection = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const navigate = useNavigate();

  const handleCreateCollection = async () => {
    try {
      const collectionResponse = await createCollection(name, symbol);

      console.log('Collection created with address:', collectionResponse.collectionAddress);

      alert('Collection created successfully!');

      navigate('/collections');
    } catch (error) {
      console.error('Error creating collection:', error);

      alert('Failed to create collection.');
    }
  };

  return (
    <div className="App">
      <h1>Create a New Collection</h1>
      <input
        type="text"
        placeholder="Collection Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Collection Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <button onClick={handleCreateCollection}>Create Collection</button>
    </div>
  );
};