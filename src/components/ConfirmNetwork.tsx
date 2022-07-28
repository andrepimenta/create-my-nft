import React, { useState } from "react";
import { Button, Grid } from "semantic-ui-react";
import { NftInfo } from "../App";
import CustomModal from "./CustomModal";
import MediaPreview from "./MediaPreview";

interface Props {
  nftInfo: NftInfo;
  onNext: () => void;
  media: any;
  fee: string;
  chainId: string | undefined;
}

const infuraProjectId = "test";

const Networks: { [index: string]: any } = {
  "0x1": {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  },
  "0xa86a": {
    chainId: "0xa86a",
    chainName: "Avalanche Mainnet C-Chain",
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    blockExplorerUrls: ["https://snowtrace.io"],
  },
  "0xa4b1": {
    chainId: "0xa4b1",
    chainName: "Arbitrum One",
    rpcUrls: [`https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  },
  "0x38": {
    chainId: "0x38",
    chainName: "BNB Smart Chain",
    rpcUrls: ["https://bsc-dataseed1.binance.org"],
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    blockExplorerUrls: ["https://bscscan.com"],
  },
  "0xfa": {
    chainId: "0xfa",
    chainName: "Fantom Opera",
    rpcUrls: ["https://rpc.ftm.tools/"],
    nativeCurrency: { name: "FTM", symbol: "FTM", decimals: 18 },
    blockExplorerUrls: ["https://ftmscan.com"],
  },
  "0x63564c40": {
    chainId: "0x63564c40",
    chainName: "Harmony Mainnet Shard 0",
    rpcUrls: ["https://api.harmony.one/"],
    nativeCurrency: { name: "ONE", symbol: "ONE", decimals: 18 },
    blockExplorerUrls: ["https://explorer.harmony.one"],
  },
  "0xa": {
    chainId: "0xa",
    chainName: "Optimism",
    rpcUrls: [`https://optimism-mainnet.infura.io/v3/${infuraProjectId}`],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
  "0x89": {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    rpcUrls: [`https://polygon-mainnet.infura.io/v3/${infuraProjectId}`],
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  "0x2a15c308d": {
    chainId: "0x2a15c308d",
    chainName: "Palm",
    rpcUrls: [`https://palm-mainnet.infura.io/v3/${infuraProjectId}`],
    nativeCurrency: { name: "PALM", symbol: "PALM", decimals: 18 },
    blockExplorerUrls: ["https://explorer.palm.io"],
  },
};

const ConfirmNetwork = ({ nftInfo, onNext, media, fee, chainId }: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const [newChainId, setNewChainId] = useState<string>();

  const getNetworkName = () => {
    if (!chainId) return;
    return Networks[chainId]?.chainName;
  };

  const getNetworkTicker = () => {
    if (!chainId) return "";
    return Networks[chainId]?.nativeCurrency?.symbol || "ETH";
  };

  const renderText = () => {
    if (chainId === "0x1")
      return `Ethereum Mainnet is the gold standard for NFTs but gas fees can be high. NFTs created on Ethereum Mainnet are available for use on NFT marketplaces like OpenSea.`;
    if (chainId === "0x89")
      return `NFTs created on Polygon are available for use on NFT marketplaces like OpenSea.`;
    return (
      <span style={{ color: "#D73A49" }}>
        NFTs created on this network may not be available on NFT marketplaces
        like OpenSea.{" "}
      </span>
    );
  };

  const renderNetworks = () => {
    const networks = [];
    const pressed = { border: "1px #037DD6 solid", borderRadius: "14px" };
    for (const chainIdItem in Networks) {
      let style = { padding: 10 };
      const chainToCompare = newChainId ? newChainId : chainId;
      if (chainToCompare === chainIdItem) {
        style = { ...style, ...pressed };
      }

      networks.push(
        <div
          style={style}
          onClick={() => setNewChainId(Networks[chainIdItem].chainId)}
        >
          {Networks[chainIdItem].chainName}
        </div>
      );
    }
    return networks;
  };

  const openNetworkModal = () => {
    setNewChainId(undefined);
    setOpenModal(true);
  };

  const addNetwork = async () => {
    if (newChainId === chainId || !newChainId) return setOpenModal(false);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: newChainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [Networks[newChainId]],
        });
      } catch (addError) {
        alert("Error adding chain")
        setOpenModal(false);
      }
    }

    setOpenModal(false);
  };

  return (
    <>
      <div style={{ marginTop: 60 }} />
      <MediaPreview file={media} small></MediaPreview>
      <div style={{ fontSize: 18, marginTop: 30 }}>
        Create NFT {getNetworkName() && " on "}
      </div>
      <div style={{ fontSize: 24, marginTop: 4 }}>
        <b>{getNetworkName()}</b>
      </div>
      <div
        style={{ marginTop: 20 }}
      >{`Estimated gas fee: < ${fee} ${getNetworkTicker()}`}</div>
      <div>Gas is a network fee, not a MetaMask fee</div>
      <div
        style={{ color: "#037DD6", paddingTop: 20, paddingBottom: 20 }}
        onClick={openNetworkModal}
      >
        Use a different network
      </div>
      <div>{renderText()}</div>
      <Button
        fluid
        style={{
          marginTop: 60,
          background: "#037DD6",
          borderRadius: 100,
          color: "white",
          paddingBottom: 18,
          paddingTop: 18,
        }}
        onClick={onNext}
      >
        Continue {getNetworkName() && `on ${getNetworkName()}`}
      </Button>
      <CustomModal
        title={"Choose a network"}
        content={<div>{renderNetworks()}</div>}
        buttons={
          <Grid columns={2}>
            <Grid.Column>
              <Button
                fluid
                style={{
                  width: 150,
                  borderRadius: 100,
                  paddingBottom: 18,
                  paddingTop: 18,
                }}
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>
            </Grid.Column>
            <Grid.Column>
              <Button
                fluid
                style={{
                  width: 150,
                  background: "#037DD6",
                  borderRadius: 100,
                  color: "white",
                  paddingBottom: 18,
                  paddingTop: 18,
                }}
                onClick={addNetwork}
              >
                Continue
              </Button>
            </Grid.Column>
          </Grid>
        }
        open={openModal}
        setOpen={setOpenModal}
      />
    </>
  );
};

export default ConfirmNetwork;
