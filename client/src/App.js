import React from "react";
import Routes from "./router/Routes";
import { ChainId, DAppProvider } from "@usedapp/core";

const config = {
  readOnlyChainId: ChainId.Rinkeby,
  readOnlyUrls: {
    [ChainId.Rinkeby]:
      "https://rinkeby.infura.io/v3/ed0dd7303c2c4cbb995e6a5536f207f9",
  },
  supportedChains: [ChainId.Rinkeby],
};

const App = (props) => {
  return (
    <DAppProvider config={config}>
      <Routes />
    </DAppProvider>
  );
};

export default App;
