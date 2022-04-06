import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { address } from "../../contracts";
import abi from "../../abis/contract.json";

const nftInterface = new ethers.utils.Interface(abi);

const ItemsCreated = () => {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(address, nftInterface, signer);
    const data = await contract.fetchItemsListed();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );

    setNfts(items);
    setLoadingState("loaded");
  }

  return (
    <div className="container my-5">
      <h1 className="mb-5">Items Listed</h1>

      <div style={{ display: "flex" }}>
        {nfts.map((nft, i) => (
          <div key={i} class="m-3 card" style={{ width: "18rem" }}>
            <img class="card-img-top" src={nft.image} alt="Card image cap" />
            <div class="card-body">
              <h5 class="card-title">{nft.name}</h5>
              <p class="card-text">{nft.description}</p>
              <div className="d-grid gap-2">
                {/* <button
                  onClick={() => buyNft(nft)}
                  className="btn btn-primary"
                  type="button"
                >
                  Buy For {nft.price} {ethers.constants.EtherSymbol}
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsCreated;
