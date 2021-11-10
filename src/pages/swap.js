/* global AlgoSigner */
import algosdk from "algosdk";
import axios from "axios";
import React, { useEffect, useCallback, useState } from "react";
import AlgoNotInstalled from "../components/algoNotInstalled";
import ErrorAlert from "../components/errorAlert";
import LoadingModal from "../components/loadingModal";
import SuccessAlert from "../components/successAlert";
import { waitForAlgosignerConfirmation } from "../js/algosignerutils";
import { DECIMAL, SWAP_ADDRESS } from "../utils/constants";

const defaultAssets = [
  {
    id: "0",
    name: "ALGO",
  },

  {
    id: "21582668",
    name: "TINYUSDC",
  },

  {
    id: "22847688",
    name: "YLDY",
  },
  {
    id: "10458941",
    name: "USDC",
  },
  {
    id: "27963203",
    name: "BOARD",
  },
  {
    id: "12400859",
    name: "Monerium",
  },
];

const Swap = () => {
  const [loadingModal, setLoadingModal] = useState(false);
  const [address, setAddress] = useState(null);
  const [assets, setAssets] = useState([]);
  const [algoSignerCheck, setAlgoSignerCheck] = useState(false);

  const [from, setfrom] = useState(null);

  const [to, setto] = useState(null);

  const [exchange, setexchange] = useState(0);
  const [amount, setamount] = useState(1);

  const ConnectAlgoSigner = useCallback(async () => {
    try {
      showProcessingModal();
      const r = await AlgoSigner.connect();

      //   document.getElementById("divAlgoSignerCheck").classList.add("is-hidden");

      //   document.getElementById("divDemoBlock").classList.remove("is-hidden");
      //   document
      //     .getElementById("btnRefreshAccounts")
      //     .classList.remove("is-hidden");
      console.log("conected");
      GetAccounts();
      hideProcessingModal();
      return JSON.stringify(r, null, 2);
    } catch (e) {
      console.error(e);
      console.log(`Couldn't find AlgoSigner!`);
      hideProcessingModal();
      setAlgoSignerCheck(true);

      //   document.getElementById("divDemoBlock").classList.add("is-hidden");
      //   document.getElementById("btnRefreshAccounts").classList.add("is-hidden");
      console.log("failed to connect ");
      return JSON.stringify(e, null, 2);
    }
  }, []);

  const GetAccounts = useCallback(async () => {
    try {
      const r = await AlgoSigner.accounts({
        ledger: "TestNet",
      });

      const _address = r[0].address;
      setAddress(_address);

      // fetch assets for this address
      const assets = await fetchAssets(r[0].address);

      setAssets(assets);

      return;
      // return JSON.stringify(r, null, 2);
    } catch (e) {
      console.error(e);
      return;
      // return JSON.stringify(e, null, 2);
    }
  }, []);

  const fetchAssets = async (account) => {
    try {
      let assetsData = [];

      const accountData = await AlgoSigner.algod({
        ledger: "TestNet",
        path: `/v2/accounts/${account}`,
      });
      await accountData.assets.reduce(
        (promise, asset) =>
          promise.then(() =>
            AlgoSigner.indexer({
              ledger: "TestNet",
              path: `/v2/assets/${asset["asset-id"]}`,
            }).then((d) => assetsData.push(d))
          ),
        Promise.resolve()
      );

      return assetsData;
    } catch (e) {
      setLoadingModal(false);
    }
  };

  const optIn = () => {
    showProcessingModal("Sending transaction...");

    let asset = defaultAssets.find((o) => o.name === to);
    let assetId = Number(asset.id);

    AlgoSigner.connect()
      // fetch current parameters
      .then(() =>
        AlgoSigner.algod({
          ledger: "TestNet",
          path: "/v2/transactions/params",
        })
      )
      // sign new opt-in transaction
      .then((txParams) =>
        AlgoSigner.sign({
          assetIndex: assetId,
          from: address,
          amount: 0,
          to: address,
          type: "axfer", // ASA Transfer (axfer)
          fee: txParams["min-fee"],
          firstRound: txParams["last-round"],
          lastRound: txParams["last-round"] + 1000,
          genesisID: txParams["genesis-id"],
          genesisHash: txParams["genesis-hash"],
          flatFee: true,
        })
      )
      // send signed transaction
      .then((signedTx) =>
        AlgoSigner.send({
          ledger: "TestNet",
          tx: signedTx.blob,
        })
      )
      // wait for confirmation from the blockchain
      .then((tx) => waitForAlgosignerConfirmation(tx)) // see algosignerutils.js
      .then((d) => {
        // was successful
        console.log({ d });
        document.getElementById("successMessage").innerHTML =
          "The transaction with TxID " +
          d["txId"] +
          " was successfully sent. <a target=&quot;_blank&quot; href='https://testnet.algoexplorer.io/tx/" +
          d["txId"] +
          "'>View on AlgoExplorer</a>";
        document.getElementById("errorDialog").classList.add("is-hidden");
        document.getElementById("successDialog").classList.remove("is-hidden");
        alert("success");
        hideProcessingModal();
      })
      .catch((e) => {
        // handleClientError(e.message);
        console.error("error", e.message);
        hideProcessingModal();
      });
  };

  const swapAsset = () => {
    showProcessingModal("Sending transaction...");

    let tx1 = {};
    let tx2 = {};
    let tx3 = {};
    let signedTx1 = {};
    let signedTx2 = {};
    let signedTx3 = {};
    let txGroup = [];

    let assetFrom = defaultAssets.find((o) => o.name === from);
    let assetTo = defaultAssets.find((o) => o.name === to);
    let assetIdFrom = Number(assetFrom.id);
    let assetIdTo = Number(assetTo.id);
    let amt = 3000;
    AlgoSigner.connect()
      // fetch current parameters
      .then(() =>
        AlgoSigner.algod({
          ledger: "TestNet",
          path: "/v2/transactions/params",
        })
      )
      // create transactions
      .then((txParams) => {
        let from = address;
        let to = SWAP_ADDRESS;
        
        console.log((Number(amount) / Number(exchange)) * DECIMAL, "amoint!!!");
        const amount1 = amount * DECIMAL;
        const amount2 = +((Number(amount) / Number(exchange)) * DECIMAL);
        
        console.log({ amount1, amount2 });

        tx1 = {
          assetIndex: Number(assetIdFrom),
          from: from,
          amount: Math.round(amount1),
          to: to,
          type: "axfer",
          fee: txParams["min-fee"],
          firstRound: txParams["last-round"],
          lastRound: txParams["last-round"] + 1000,
          genesisID: txParams["genesis-id"],
          genesisHash: txParams["genesis-hash"],
          flatFee: true,
        };

        tx2 = {
          assetIndex: Number(assetIdTo),
          from: to,
          amount: Math.round(amount2),
          to: from,
          type: "axfer",
          fee: txParams["min-fee"],
          firstRound: txParams["last-round"],
          lastRound: txParams["last-round"] + 1000,
          genesisID: txParams["genesis-id"],
          genesisHash: txParams["genesis-hash"],
          flatFee: true,
        };

        tx3 = {
          assetIndex: Number(10458941),
          from: from,
          amount: Math.round(20000),
          to: to,
          type: "axfer",
          fee: txParams["min-fee"],
          firstRound: txParams["last-round"],
          lastRound: txParams["last-round"] + 1000,
          genesisID: txParams["genesis-id"],
          genesisHash: txParams["genesis-hash"],
          flatFee: true,
        };

        // assigns a group id to the transaction set
        console.log("reached s");
        console.log(tx1);
        console.log(tx2);
        console.log(tx3);
        return algosdk.assignGroupID([tx1, tx2,tx3]);
      })
      .then((txGroup) => {
        console.log("entered!!!");
        // Modify the group fields in original transactions to be base64 encoded strings
        tx1.group = txGroup[0].group.toString("base64");
        tx2.group = txGroup[1].group.toString("base64");
        tx3.group = txGroup[2].group.toString("base64");

        console.log(tx1.group, tx2.group,tx3.group);
      })
      
      // sign transaction 1
      .then(() => AlgoSigner.sign(tx1))
      .then((d) => (signedTx1 = d))
      // sign transaction 2
      .then(() => AlgoSigner.sign(tx2))
      .then((d) => (signedTx2 = d))
      // sign transaction 3
      .then(() => AlgoSigner.sign(tx3))
      .then((d) => (signedTx3 = d))
      .then(() => {
        // Get the decoded binary Uint8Array values from the blobs
        const decoded_1 = new Uint8Array(
          atob(signedTx1.blob)
            .split("")
            .map((x) => x.charCodeAt(0))
        );
        const decoded_2 = new Uint8Array(
          atob(signedTx2.blob)
            .split("")
            .map((x) => x.charCodeAt(0))
        );
        const decoded_3 = new Uint8Array(
          atob(signedTx3.blob)
            .split("")
            .map((x) => x.charCodeAt(0))
        );


        

        // Use their combined length to create a 3rd array
        let combined_decoded_txns = new Uint16Array(
          decoded_1.byteLength + decoded_2.byteLength + decoded_3.byteLength
        );
        console.log(combined_decoded_txns);
        console.log(decoded_2);
        console.log(decoded_3);
        // Starting at the 0 position, fill in the binary for the first object
        combined_decoded_txns.set(new Uint8Array(decoded_1), 0);
        // Starting at the first object byte length, fill in the 2nd binary value
        combined_decoded_txns.set(
          new Uint8Array(decoded_2),
          decoded_1.byteLength
        );
        combined_decoded_txns.set(
          new Uint8Array(decoded_2),
          decoded_1.byteLength
        );

        // Modify our combined array values back to an encoded 64bit string
        const grouped_txns = btoa(
          String.fromCharCode.apply(null, combined_decoded_txns)
        );

        return AlgoSigner.send({
          ledger: "TestNet",
          tx: grouped_txns,
        });
      })
      // wait for confirmation from the blockchain
      .then((tx) => waitForAlgosignerConfirmation(tx)) // see algosignerutils.js
      .then((tx) => {
        console.log("success , ", { tx });
        // was successful
        document.getElementById("successMessage").innerHTML =
          "The transaction with TxID " +
          tx.txId +
          " was successfully sent. <a target=&quot;_blank&quot; href='https://testnet.algoexplorer.io/tx/" +
          tx.txId +
          "'>View on AlgoExplorer</a>";
        document.getElementById("errorDialog").classList.add("is-hidden");
        document.getElementById("successDialog").classList.remove("is-hidden");
        hideProcessingModal();
      })
      .catch((e) => {
        // handleClientError(e.message);
        console.error(e.message);
        hideProcessingModal();
      });
  };

  function showProcessingModal(message) {
    document.getElementById("processingModal").classList.add("is-active");
    document.body.style.overflow = "hidden";
    //document.body.style.position = "fixed";
  }

  function hideProcessingModal() {
    document.getElementById("processingModal").classList.remove("is-active");
    document.body.style.overflow = "auto";
    //document.body.style.position = "";
  }

  useEffect(() => {
    if (typeof AlgoSigner !== "undefined") {
      ConnectAlgoSigner();
    } else {
      console.log("algo signer isnt installed");
    }
  }, []);

  const fetchRate = async () => {
    console.log(`https://tinymanapi.herokuapp.com/assets?pair=${from}${to}`);
    const result = await axios.get(
      `https://tinymanapi.herokuapp.com/assets?pair=${from}${to}`
    );
    const { data } = result;
    if (!data) {
      console.log("no data");
      return null;
    }
    // console.log({ data });
    const res = `${from}per${to}`;
    // console.log(data[0]?.res);

    const response = data[0];
    console.log(response[res]);

    if (response[res]) {
      console.log("data", response[res]);
      setexchange(response[res]);
      return;
    }
  };

  useEffect(() => {
    console.log({ from, to });
    if (from && to) {
      fetchRate();
    }
  }, [to, from]);

  return (
    <>
      <section class="section">
        <div class="container">
          {/* <SuccessAlert />
          <ErrorAlert /> */}

          {algoSignerCheck && <AlgoNotInstalled />}

          {!algoSignerCheck && (
            <div id="divDemoBlock">
              <h1 class="title">Create an Atomic Transfer</h1>

              <p class="subtitle">
                In this example, you should use two accounts to trade two
                different assets you have created.
              </p>

              <div class="columns">
                <div class="column">
                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">From</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control is-expanded has-icons-left">
                          <div class="select is-fullwidth">
                            <select
                              id="fromAccountOnLeftSide"
                              value={from}
                              onChange={(e) => {
                                // console.log(e.target.value);
                                if (e.target.value === to) return;
                                setfrom(e.target.value);
                              }}
                            >
                              <option selected value={null} disabled>
                                Select a token
                              </option>
                              {defaultAssets.map((asset, index) => (
                                <option value={asset.name}>{asset.name}</option>
                              ))}
                            </select>
                          </div>
                          <div class="icon is-small is-left">
                            <i class="fas fa-wallet"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">To</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control is-expanded has-icons-left">
                          <div class="select is-fullwidth">
                            <select
                              value={to}
                              id="assetOnLeftSide"
                              onChange={(e) => {
                                // console.log(e.target.value);
                                if (e.target.value === from) return;
                                setto(e.target.value);
                              }}
                            >
                              <option selected value={null} disabled>
                                Select a token
                              </option>
                              {defaultAssets.map((asset, index) => (
                                <option value={asset.name}>{asset.name}</option>
                              ))}
                            </select>
                          </div>
                          <div class="icon is-small is-left">
                            <i class="fas fa-wallet"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Amount</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control is-expanded has-icons-left">
                          <input
                            class="input"
                            id="amountOnLeftSide"
                            defaultValue={amount}
                            onChange={(e) => {
                              setamount(e.target.value);
                            }}
                          />
                          <div class="icon is-small is-left">
                            <i class="fas fa-coins"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {exchange > 0 && (
                    <div class="field is-horizontal">
                      <div class="field-label is-normal">
                        <label class="label">Conversion rate</label>
                      </div>
                      <div class="field-body">
                        <div class="field">
                          <div class="control is-expanded has-icons-left">
                            <input
                              class="input"
                              id="amountOnLeftSide"
                              value={`you would get ${parseFloat(
                                Number(amount) / Number(exchange)
                              ).toFixed(4)} ${to} for ${amount} ${from}`}
                            />
                            <div class="icon is-small is-left">
                              <i class="fas fa-coins"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                class="button is-dark is-fullwidth"
                id="btnTradeAssets"
                onClick={swapAsset}
              >
                Trade Assets
              </button>

              <br></br>
              <br></br>
              <button
                class="button is-dark is-fullwidth"
                id="btnTradeAssets"
                onClick={optIn}
              >
                opt In
              </button>
            </div>
          )}
        </div>
      </section>
      <LoadingModal />
    </>
  );
};

export default Swap;
