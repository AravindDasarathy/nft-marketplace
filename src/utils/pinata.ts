// src/utils/apiUtils.ts

import axios from 'axios';

const base64ToBlob = (base64: string, type: string) => {
  try {
    const base64Data = base64.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid Base64 string');
    }
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  } catch (error) {
    console.error('Error converting Base64 string to Blob:', error);
    throw error;
  }
};

const pinFileToIPFSRequest = async (data: FormData) => {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
  const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

  const headers = {
    'Content-Type': 'multipart/form-data',
    'pinata_api_key': pinataApiKey,
    'pinata_secret_api_key': pinataSecretApiKey
  };

  try {
    const response = await axios.post(url, data, {
      maxContentLength: Infinity,
      headers,
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

export const pinFileToIPFS = async (imageContent: string) => {
  const blob = base64ToBlob(imageContent, 'image/png');
  let data = new FormData();
  data.append('file', blob);

  return pinFileToIPFSRequest(data);
};

export const pinMetadataToIPFS = async (metadata: any) => {
  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const metadataData = new FormData();
  metadataData.append('file', metadataBlob, 'metadata.json');

  return pinFileToIPFSRequest(metadataData);
};