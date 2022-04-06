import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { address } from "../../contracts";
import abi from "../../abis/contract.json";

const nftInterface = new ethers.utils.Interface(abi);

const ItemsCreated = () => {
  const [nfts, setNfts] = useState([]);
  const [formInput, updateFormInput] = useState({ price: "" });
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(address, nftInterface, signer);
    const data = await contract.fetchMyNFTs();

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

  const listNFTForSale = async (id, price) => {
    if (!price) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const priceFormatted = ethers.utils.parseUnits(price, "ether");
    let contract = new ethers.Contract(address, nftInterface, signer);
    let listingPrice = await contract.getListingPrice();

    listingPrice = listingPrice.toString();
    let transaction = await contract.resellToken(id, priceFormatted, {
      value: listingPrice,
    });
    await transaction.wait();
  };

  return (
    <div className="container my-5">
      <h1 className="mb-5">My NFTs</h1>

      <div style={{ display: "flex" }}>
        {nfts.map((nft, i) => (
          <div key={i} class="m-3 card" style={{ width: "18rem" }}>
            <img class="card-img-top" src={nft.image} alt="Card image cap" />
            <div class="card-body">
              <h5 class="card-title">{nft.name}</h5>
              <p class="card-text">{nft.description}</p>
              <div className="d-grid gap-2">
                <div>Re List</div>

                <div class="mb-3">
                  <label for="exampleInputEmail1" class="form-label"></label>
                  <input
                    onChange={(e) =>
                      updateFormInput({ ...formInput, price: e.target.value })
                    }
                    type="email"
                    class="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                  />
                </div>
                <button
                  onClick={() => listNFTForSale(nft.tokenId, formInput.price)}
                  className="btn btn-primary"
                  type="button"
                >
                  Buy For {nft.price} {ethers.constants.EtherSymbol}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsCreated;
