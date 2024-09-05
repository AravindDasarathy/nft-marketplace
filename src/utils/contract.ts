import { ethers } from 'ethers';
import NFTFactory from '../abi/NFTFactory.json';
import NFTMarketplace from '../abi/NFTMarketplace.json';

const provider = new ethers.providers.Web3Provider((window as any).ethereum);
const signer = provider.getSigner();

const FACTORY_CONTRACT_ADDRESS = process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS || '';
const MARKETPLACE_CONTRACT_ADDRESS = process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS || '';
let FACTORY_CONTRACT: ethers.Contract;
let MARKETPLACE_CONTRACT: ethers.Contract;

try {
  FACTORY_CONTRACT = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, NFTFactory.abi, signer);
} catch (error) {
  console.error('Error initializing factory contract:', error);

  alert('Failed to initialize factory contract.');
  throw error;
}

try {
  MARKETPLACE_CONTRACT = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, NFTMarketplace.abi, signer);
} catch (error) {
  console.error('Error initializing marketplace contract:', error);

  alert('Failed to initialize marketplace contract.');
  throw error;
}

const PAYMENT_HANDLER_ADDRESS = process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS || '';

export const getNftFactoryContract = () => FACTORY_CONTRACT;
export const getNftMarketplaceContract = () => MARKETPLACE_CONTRACT;
export const getProvider = () => provider;
export const getSigner = () => signer;

export const createCollection = async (name: string, symbol: string) => {
  const transaction = await FACTORY_CONTRACT.createCollection(name, symbol, PAYMENT_HANDLER_ADDRESS);
  const receipt = await transaction.wait();

  return receipt.events[0].args;
}

export const getCollections = () => FACTORY_CONTRACT.getCollections();

export const createNft = (metadataUrl: string, paymentTokenAddress: string, price: number) =>
  FACTORY_CONTRACT.createNFT(metadataUrl, paymentTokenAddress, ethers.utils.parseUnits(price.toString(), 18), {
    gasLimit: 600000,
  });

export const listErc1155 = (erc1155TokenAddress: string, tokenId: number, amount: number, price: number) =>
  FACTORY_CONTRACT.listERC1155(erc1155TokenAddress, tokenId, amount, ethers.utils.parseUnits(price.toString(), 18), {
    gasLimit: 600000,
  });

export const signMessage = async (metadataUrl: string, paymentTokenAddress: string, price: number) => {
  const messageHash = ethers.utils.solidityKeccak256(
    ['string', 'address', 'uint256'],
    [metadataUrl, paymentTokenAddress, ethers.utils.parseUnits(price.toString(), 18)]
  );
  const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));

  console.log('Seller Signature:', signature);

  return {
    signature,
    listNftSignature: await FACTORY_CONTRACT.listNFTSignature(metadataUrl, paymentTokenAddress,
      ethers.utils.parseUnits(price.toString(), 18), signature, {
      gasLimit: 600000,
    })
  }
}

export const createGovernancePropsoal = async (metadataUrl: string, paymentTokenAddress: string, price: number) =>
  FACTORY_CONTRACT.createProposal(metadataUrl, paymentTokenAddress, ethers.utils.parseUnits(price.toString(), 18), {
    gasLimit: 600000,
  });

export const fetchAllNfts = async () => MARKETPLACE_CONTRACT.fetchAllNFTs();

export const handlePurchaseErc20 = async (paymentTokenAddress: string, price: number, tokenId: number) => {
  const account = await signer.getAddress();
  const paymentToken = new ethers.Contract(paymentTokenAddress, [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) public returns (bool)"
  ], signer);

  const tokenBalance = await paymentToken.balanceOf(account);
  const allowance = await paymentToken.allowance(account, PAYMENT_HANDLER_ADDRESS);

  console.log('ERC20 Token Balance:', tokenBalance.toString());
  console.log('Allowance:', allowance.toString());

  const priceInWei = ethers.utils.parseUnits(price.toString(), 18);

  if (tokenBalance.lt(priceInWei)) {
    alert('Insufficient token balance to purchase NFT.');
    return;
  }

  if (allowance.lt(priceInWei)) {
    const approveTx = await paymentToken.approve(PAYMENT_HANDLER_ADDRESS, priceInWei);
    await approveTx.wait();
    console.log('Tokens approved successfully.');
  }

  console.log('Purchasing ERC20 NFT with price:', priceInWei.toString());

  const transaction = await MARKETPLACE_CONTRACT.purchaseNFT(tokenId, { gasLimit: 500000 });
  await transaction.wait();
}

export const handlePurchaseErc1155 = async (price: number, amount: number, tokenId: number) => {
  const priceInWei = ethers.utils.parseUnits(price.toString(), 'ether');

  console.log('Price in Wei:', priceInWei.toString());
  console.log('Amount:', amount);

  // Ensure all required values are defined
  if (!priceInWei || !amount || !tokenId) {
    console.error('Missing required values for ERC1155 purchase');
    return;
  }

  return MARKETPLACE_CONTRACT.purchaseERC1155(tokenId, amount,
    {
      value: priceInWei.mul(amount),
      gasLimit: 500000
    }
  );
}

export const handlePurchaseErc20Signature = async (price: string, paymentTokenAddress: string, tokenId: number, sellerSignature: string) => {
  const account = await signer.getAddress();
  const priceInWei = ethers.utils.parseUnits(price.toString(), 18);
  const messageHash = ethers.utils.solidityKeccak256(['uint256', 'uint256', 'address'], [tokenId, priceInWei, account]);

  const paymentToken = new ethers.Contract(paymentTokenAddress, [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) public returns (bool)"
  ], signer);

  const tokenBalance = await paymentToken.balanceOf(account);
  const allowance = await paymentToken.allowance(account, PAYMENT_HANDLER_ADDRESS);

  console.log('ERC20 Token Balance:', tokenBalance.toString());
  console.log('Allowance:', allowance.toString());

  if (tokenBalance.lt(priceInWei)) {
    alert('Insufficient token balance to purchase NFT.');
    return;
  }

  if (allowance.lt(priceInWei)) {
    const approveTx = await paymentToken.approve(PAYMENT_HANDLER_ADDRESS, priceInWei);
    await approveTx.wait();
    console.log('Tokens approved successfully.');
  }

  return MARKETPLACE_CONTRACT.purchaseNFTWithSignature(tokenId, priceInWei, account, sellerSignature,
    { gasLimit: 500000  }
  );
}

export const getProposalCounter = () => MARKETPLACE_CONTRACT.proposalCounter();

export const getProposal = (proposalId: number) => MARKETPLACE_CONTRACT.proposals(proposalId);

export const voteOnProposal = (proposalId: number) => MARKETPLACE_CONTRACT.voteOnProposal(proposalId);

export const executeProposal = (proposalId: number) => MARKETPLACE_CONTRACT.executeProposal(proposalId);