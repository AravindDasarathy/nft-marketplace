import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { wagmiConfig } from './config/config';
import {
  CreateCollection,
  ViewCollections,
  CollectionOptions,
  ConnectWallet,
  ListNft,
  ViewNfts,
  Proposals
} from './components';

const queryClient = new QueryClient();

const NavBar = () => (
  <nav>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/create-collection">Create Collection</Link>
      </li>
      <li>
        <Link to="/collections">View Collections</Link>
      </li>
    </ul>
  </nav>
);

const Home = () => (
  <div className="App">
    <h1>Welcome to the NFT Marketplace</h1>
    <p>Use the navigation above to create a new NFT collection or view existing collections.</p>
  </div>
);

const RoutePaths = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/create-collection" element={<CreateCollection />} />
    <Route path="/collections" element={<ViewCollections />} />
    <Route path="/collections/:address" element={<CollectionOptions />} />
    <Route path="/collections/:address/list-nft" element={<ListNft />} />
    <Route path="/collections/:address/view-nfts" element={<ViewNfts />} />
    <Route path="/collections/:address/proposals" element={<Proposals />} />
  </Routes>
);

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <Router>
        <NavBar />
        <RoutePaths />
      </Router>

      <ConnectWallet />
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
