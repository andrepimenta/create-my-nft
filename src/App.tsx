import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { ethers } from "ethers";

import abi from "./Contract/ABI/MetaMaskCreateMyNFT.json";
import bytecode from "./Contract/Bytecode/MetaMaskCreateMyNFT.json";
import { Button, Container } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import EditNFT from "./components/EditNFT";
import ConfirmNFT from "./components/ConfirmNFT";
import ConfirmNetwork from "./components/ConfirmNetwork";
//import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk";
//import { EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum";
import CustomModal from "./components/CustomModal";
import { Icon } from "semantic-ui-react";
import MediaPreview from "./components/MediaPreview";

declare global {
  interface Window {
    ethereum: any;
  }
}

export interface Attribute {
  trait_type: string;
  value: string;
}

export interface NftInfo {
  name: string;
  description: string;
  attributes: Attribute[];
}

enum Status {
  UploadingToIPFS = 0,
  WaitingTransactionApproval = 1,
  WaitingTransactionSuccessful = 2,
  AddingNFTWallet = 3,
  Done = 4,
}

enum Screen {
  edit = "EDIT",
  network = "NETWORK",
  confirm = "CONFIRM",
}

function App() {
  const [nftInfo, setNftInfo] = useState<NftInfo>({
    name: "",
    description: "",
    attributes: [{ trait_type: "", value: "" }],
  });

  const [fee, setFee] = useState<string>("loading");

  const [media, setMedia] = useState<any>();

  const [screen, setScreen] = useState<Screen>(Screen.edit);

  const [chainId, setChainId] = useState<string>();

  const [status, setStatus] = useState<Number>();
  const [openModal, setOpenModal] = useState(false);

  const provider = useRef<ethers.providers.Web3Provider>();
  const factory = useRef<ethers.ContractFactory>();

  const getProvider = () => {
    // Etherjs with MetaMask provider
    provider.current = new ethers.providers.Web3Provider(window.ethereum);
    return provider.current;
  };

  const getFactory = () => {
    if (!provider?.current) return alert("No smart-contract present");
    if (factory.current) return factory.current;

    // The factory we use for deploying contracts
    factory.current = new ethers.ContractFactory(
      abi,
      bytecode,
      provider.current.getSigner()
    );
  };

  const calculateFee = useCallback(async () => {
    const provider = getProvider();
    const factory = getFactory();

    if (!provider || !factory) return alert("No provider present");

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const gasPrice = await ethers.getDefaultProvider().getFeeData();

    const testName = "QmR7AC2E62dhe4F7EqSwsfU6wgqXs7ZGZHyyvk5FEKGDt6";
    const testURI = "ipfs://QmR7AC2E62dhe4F7EqSwsfU6wgqXs7ZGZHyyvk5FEKGDt6";

    const estimatedGas = await provider.estimateGas({
      from: window.ethereum.selectedAddress,
      data: factory.getDeployTransaction(testName, testName, testURI).data,
    });

    const gasPriceToUse = gasPrice.maxFeePerGas || gasPrice.gasPrice;

    const transactionFee = gasPriceToUse?.mul(estimatedGas);

    const fee = ethers.utils.formatUnits(
      ethers.BigNumber.from(transactionFee),
      "ether"
    );

    setFee(Number(fee).toFixed(2));
  }, []);

  const requestChainId = async () => {
    const chainIdToSet = await window.ethereum.request({
      method: "eth_chainId",
    });
    setChainId(chainIdToSet);
    window.ethereum.on("chainChanged", (chain: string) => {
      setChainId(chain);
    });
  };

  useEffect(() => {
    if (!window.ethereum) return;

    factory.current = undefined;
    provider.current = undefined;

    getProvider();
    getFactory();
    calculateFee();
  }, [calculateFee]);

  useEffect(() => {
    if (!window.ethereum) return;
    requestChainId();
  }, []);

  const deployNFT = async (uri: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // The factory we use for deploying contracts
    const factory = new ethers.ContractFactory(
      abi,
      bytecode,
      provider.getSigner()
    );

    const contract = await factory.deploy(nftInfo.name, nftInfo.name, uri);

    setStatus(Status.WaitingTransactionSuccessful);

    const contractHash = await contract.deployTransaction.wait();

    return contractHash.contractAddress;
  };

  /* For future use with rarible
  const deployRarible = async (url: string) => {
    const prov = new EthersWeb3ProviderEthereum(provider);
    const sdk = createRaribleSdk(prov, "rinkeby", {
      fetchApi: fetch,
    });

    const mintFormInitial = {
      id: "0x6ede7f3c26975aad32a475e1021d8f6f39c89d82", // default collection on "rinkeby" that supports lazy minting
      type: "ERC721",
      isLazy: true,
      isLazySupported: true,
      loading: false,
    };

    const nftCollection = await sdk.apis.nftCollection.getNftCollectionById({
      collection: mintFormInitial.id,
    });
    const tx = await sdk.nft.mint({
      uri: url,
      royalties: [],
      // @ts-expect-error
      collection: nftCollection,
    });

    console.log("RARIBLE", tx);
    return tx;
  };
  */

  const uploadDataToIpfs = async (data: any): Promise<Response> => {
    const formData = new FormData();

    formData.append("file", data);

    const ipfsAddResponse = await fetch(
      "https://ipfs.infura.io:5001/api/v0/add",
      {
        method: "POST",
        body: formData,
      }
    );

    const addResponse = await ipfsAddResponse.json();

    const ipfsPinResponse = await fetch(
      `https://ipfs.infura.io:5001/api/v0/pin/add?arg=${addResponse.Hash}`,
      {
        method: "POST",
      }
    );

    await ipfsPinResponse.json();

    return addResponse.Hash;
  };

  const confirmEdit = async () => {
    setScreen(Screen.network);
  };

  const confirmNetwork = () => {
    setScreen(Screen.confirm);
  };

  const addNFTtoWallet = async (address: string) => {
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: { type: "ERC721", options: { address, tokenId: "1" } },
    });
  };

  const confirmNFT = async () => {
    try {
      setStatus(Status.UploadingToIPFS);
      setOpenModal(true);
      const ipfsMediaHash = await uploadDataToIpfs(media);
      const metadata = JSON.stringify({
        ...nftInfo,
        image: `ipfs://${ipfsMediaHash}`,
      });
      const metadataResponse = await uploadDataToIpfs(metadata);

      setStatus(Status.WaitingTransactionApproval);

      const address = await deployNFT(`ipfs://${metadataResponse}`);
      //await deployRarible(`ipfs://${metadataResponse}`);

      setStatus(Status.AddingNFTWallet);
      await addNFTtoWallet(address);

      setStatus(Status.Done);
    } catch (error) {
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      alert(`Please try again. There was an error: ${message}`);
      window.location.reload();
    }
  };

  const renderScreen = () => {
    if (Screen.edit === screen)
      return (
        <EditNFT
          nftInfo={nftInfo}
          setNftInfo={setNftInfo}
          onNext={confirmEdit}
          media={media}
          setMedia={setMedia}
        />
      );
    if (screen === Screen.network)
      return (
        <ConfirmNetwork
          fee={fee}
          media={media}
          nftInfo={nftInfo}
          chainId={chainId}
          onNext={confirmNetwork}
        />
      );
    if (screen === Screen.confirm)
      return <ConfirmNFT media={media} nftInfo={nftInfo} onNext={confirmNFT} />;
  };

  const renderStatuses = () => {
    if (status === undefined) return <></>;
    return status === Status.Done ? (
      <>
        <MediaPreview file={media} small={false}></MediaPreview>
        <div style={{ textAlign: "center" }}>
          Nicely done! To see your NFT, go to your wallet and open the NFT tab.
        </div>
      </>
    ) : (
      <div style={{ fontSize: 16 }}>
        <div style={{marginTop: 10, marginBottom: 10}}>
          <b>
            This may take a few minutes, so keep your app open until you're
            redirected.
          </b>
        </div>
        <div style={{ padding: 10, fontSize: 16 }}>
          <span style={{ marginRight: 6 }}>
            1 - Uploading NFT media to IPFS{" "}
          </span>
          {status === Status.UploadingToIPFS ? (
            <Icon style={{ color: "#037DD6" }} loading name="spinner" />
          ) : status > Status.UploadingToIPFS ? (
            <Icon style={{ color: "green" }} name="check" />
          ) : (
            ""
          )}
        </div>
        <div style={{ padding: 10, fontSize: 16 }}>
          <span style={{ marginRight: 6 }}>2 - Approving transaction </span>
          {status === Status.WaitingTransactionApproval ? (
            <Icon style={{ color: "#037DD6" }} loading name="spinner" />
          ) : status > Status.WaitingTransactionApproval ? (
            <Icon style={{ color: "green" }} name="check" />
          ) : (
            ""
          )}
        </div>
        <div style={{ padding: 10, fontSize: 16 }}>
          <span>3 - Finalizing transaction </span>
          {status === Status.WaitingTransactionSuccessful ? (
            <Icon style={{ color: "#037DD6" }} loading name="spinner" />
          ) : status > Status.WaitingTransactionSuccessful ? (
            <Icon style={{ color: "green" }} name="check" />
          ) : (
            ""
          )}
        </div>
        <div style={{ padding: 10, fontSize: 16 }}>
          <span style={{ marginRight: 6 }}>4 - Adding NFT to wallet </span>
          {status === Status.AddingNFTWallet ? (
            <Icon style={{ color: "#037DD6" }} loading name="spinner" />
          ) : status > Status.AddingNFTWallet ? (
            <Icon style={{ color: "green" }} name="check" />
          ) : (
            ""
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Container align="middle">
        <div style={{ maxWidth: 700, marginTop: 20 }}>{renderScreen()}</div>
        <CustomModal
          title={status === 4 ? "Your NFT is ready!" : "Creating NFT..."}
          content={renderStatuses()}
          buttons={
            status === 4 ? (
              <Button
                fluid
                style={{
                  marginRight: "auto",
                  marginLeft: "auto",
                  width: 150,
                  background: "#037DD6",
                  borderRadius: 100,
                  color: "white",
                  paddingBottom: 18,
                  paddingTop: 18,
                }}
                onClick={() => window.location.reload()}
              >
                Close
              </Button>
            ) : (
              <></>
            )
          }
          open={openModal}
          setOpen={setOpenModal}
        />
      </Container>
    </div>
  );
}

export default App;
