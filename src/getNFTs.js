// import NFTs from '../../.cache/devnet-temp.json';
import axios from "axios";
import { writeFile, existsSync, mkdirSync, writeFileSync } from "fs";
import { clusterApiUrl } from "@solana/web3.js";
import {
  getParsedNftAccountsByOwner,
  isValidSolanaAddress,
  createConnectionConfig,
} from "@nfteyez/sol-rayz";
const URI = [];
const name = [];
let { log } = console;

const getAllNftData = async (account) => {
  try {
    const connect = createConnectionConfig(clusterApiUrl("devnet"));
    const result = isValidSolanaAddress(account);
    log("Valid Account:", result);
    const nfts = await getParsedNftAccountsByOwner({
      publicAddress: account,
      connection: connect,
      serialization: true,
    });
    const links = getURI(nfts);
    const json = await Promise.all(
      links.map((endpoint) => axios.get(endpoint))
    ).then(
      axios.spread((...allData) => {
        return Promise.all(allData);
      })
    );
    saveNftByCollection(json);
    log("Collection Fetched");
  } catch (error) {
    console.error(error);
  }
};

function getURI(response) {
  for (let i in response) {
    URI.push(response[i].data.uri);
    name.push(response[i].data.name);
  }
  return URI;
}

function saveNftByCollection(response) {
  for (let i in response) {
    const metadata = response[i].data;
    const symbol = metadata.symbol;
    if (!existsSync(`src/collections/${symbol}/`)) {
      mkdirSync(`src/collections/${symbol}/`, {
        recursive: true,
      });
      writeFileSync(
        `src/collections/${symbol}/` + i + ".json",
        JSON.stringify(metadata),
        function (err) {
          if (err) {
            console.error(err);
          }
        }
      );
    } else if (existsSync(`src/collections/${symbol}/`)) {
      writeFileSync(
        `src/collections/${symbol}/` + i + ".json",
        JSON.stringify(metadata),
        function (err) {
          if (err) {
            console.error(err);
          }
        }
      );
    } else {
      console.log("error in making/finding folder");
      return;
    }
  }
}

export { getAllNftData };
