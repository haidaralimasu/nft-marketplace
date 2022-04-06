import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { address } from "../../contracts";
import abi from "../../abis/contract.json";

const nftInterface = new ethers.utils.Interface(abi);

const BuyItems = () => {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner();
    // const provider = new ethers.providers.JsonRpcProvider();
    const contract = new ethers.Contract(address, nftInterface, provider);
    const data = await contract.fetchMarketItems();

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
  };

  const buyNft = async (nft) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(address, nftInterface, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });
    await transaction.wait();
    loadNFTs();
  };

  return (
    <div className="container my-5">
      <h1 className="mb-5">Buy Items</h1>

      <div style={{ display: "flex" }}>
        {nfts.map((nft, i) => (
          <div key={i} class="m-3 card" style={{ width: "18rem" }}>
            <img class="card-img-top" src={nft.image} alt="Card image cap" />
            <div class="card-body">
              <h5 class="card-title">{nft.name}</h5>
              <p class="card-title">Price: {nft.price}</p>

              <div className="d-grid gap-2">
                <button
                  type="button"
                  class="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal"
                >
                  View
                </button>

                <div
                  class="modal fade"
                  id="exampleModal"
                  tabindex="-1"
                  aria-labelledby="exampleModalLabel"
                  aria-hidden="true"
                >
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">
                          {nft.name}
                        </h5>
                        <button
                          type="button"
                          class="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <img
                        class="card-img-top"
                        src={nft.image}
                        alt="Card image cap"
                      />
                      <h5 class="modal-body">Price: {nft.name}</h5>
                      <h5 class="modal-body">
                        Price: {nft.price} {ethers.constants.EtherSymbol}
                      </h5>
                      <div class="modal-body">Seller: {nft.seller}</div>

                      <div class="modal-body">{nft.description}</div>
                      <div class="modal-footer">
                        <button
                          type="button"
                          class="btn btn-secondary"
                          data-bs-dismiss="modal"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => buyNft(nft)}
                          type="button"
                          class="btn btn-primary"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyItems;
