import React, { useState } from "react";

import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { address } from "../../contracts";
import abi from "../../abis/contract.json";

const nftInterface = new ethers.utils.Interface(abi);
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

client.pin.add("QmeGAVddnBSnKc1DLE7DLV9uuTqo5F7QbaveTjr45JUdQn").then((res) => {
  console.log(res);
});

const CreateItems = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });

  const onChange = async (e) => {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const uploadToIPFS = async () => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      return url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const listNFTForSale = async () => {
    const url = await uploadToIPFS();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInput.price, "ether");
    let contract = new ethers.Contract(address, nftInterface, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    let transaction = await contract.createToken(url, price, {
      value: listingPrice,
    });
    await transaction.wait();
  };

  return (
    <div className="container my-5">
      <h1 className="mb-5">Create NFT</h1>
      <div className="mb-3">
        <label for="exampleFormControlInput1" className="form-label">
          Name
        </label>
        <input
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
          type="Name"
          className="form-control"
          id="exampleFormControlInput1"
        />
      </div>
      <div className="mb-3">
        <label for="exampleFormControlTextarea1" className="form-label">
          Description
        </label>
        <textarea
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
          className="form-control"
          id="exampleFormControlTextarea1"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-3">
        <label for="exampleFormControlInput1" className="form-label">
          Price
        </label>
        <input
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
          type="number"
          className="form-control"
          id="exampleFormControlInput1"
        />
      </div>
      <div className="mb-3">
        <label for="formFile" className="form-label">
          Image
        </label>
        <input
          onChange={onChange}
          className="form-control"
          type="file"
          id="formFile"
        />
      </div>
      <div>
        {fileUrl && (
          <img
            style={{ margin: "20px" }}
            width="350px"
            height="350px"
            alt="uploaded img"
            src={fileUrl}
          />
        )}
      </div>
      <div className="d-grid gap-2">
        <button
          onClick={() => listNFTForSale()}
          className="btn btn-primary"
          type="button"
        >
          Create NFT
        </button>
      </div>
    </div>
  );
};

export default CreateItems;
