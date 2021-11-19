/* global AlgoSigner */
import React, { useEffect, useCallback, useState } from "react";
import Nav from "../components/nav";
import MyAlgo from '@randlabs/myalgo-connect';
import algosdk from "algosdk";

const Transfer = () => {
  const [addressOne, setaddressOne] = useState(null);
  const [addressTwo, setaddressTwo] = useState(null);
  const [addressList, setaddressList] = useState([]);

  // make transfer form
  const [from, setfrom] = useState("");
  const [to, setto] = useState("");
  const [amount, setamount] = useState("");
  const [note, setnote] = useState("");

  const CheckAlgoSigner = () => {
    const action = useCallback(() => {
      if (typeof AlgoSigner !== "undefined") {
        return "AlgoSigner is installed.";
      } else {
        return "AlgoSigner is NOT installed.";
      }
    }, []);
  };

  const GetAccounts = useCallback(async () => {
    try {
      const r = await AlgoSigner.accounts({
        ledger: "TestNet",
      });
      // console.log({ r });
      setaddressOne(r[0].address);
      setfrom(r[0].address);
      if (setaddressTwo(r[1]?.address)) {
        setaddressTwo(r[1].address);
        setto(r[1].address);
      } else {
        setto(r[0].address);
      }

      await setaddressList(r);

      return;
      // return JSON.stringify(r, null, 2);
    } catch (e) {
      console.error(e);
      return;
      // return JSON.stringify(e, null, 2);
    }
  }, []);


  const myAlgoWallet = new MyAlgo();

  const connectToMyAlgo = useCallback(async() => {
  try {
    const accounts = await myAlgoWallet.connect();

    const addresses = accounts.map(account => account.address);
    console.log(addresses)
    
  } catch (err) {
    console.error(err);
  }
},[]);



  const ConnectAlgoSigner = useCallback(async () => {
    try {
      const r = await AlgoSigner.connect();

      document.getElementById("divAlgoSignerCheck").classList.add("is-hidden");
      document.getElementById("divDemoBlock").classList.remove("is-hidden");
      document
        .getElementById("btnRefreshAccounts")
        .classList.remove("is-hidden");
      console.log("conected");
      GetAccounts();
      return JSON.stringify(r, null, 2);
    } catch (e) {
      console.error(e);
      console.log(`Couldn't find AlgoSigner!`);
      document
        .getElementById("divAlgoSignerCheck")
        .classList.remove("is-hidden");
      document.getElementById("divDemoBlock").classList.add("is-hidden");
      document.getElementById("btnRefreshAccounts").classList.add("is-hidden");
      console.log("failed to connect ");
      return JSON.stringify(e, null, 2);
    }
  }, []);


  const showProcessingModal = (message) => {
    document.getElementById("processingModal").classList.add("is-active");
    document.body.style.overflow = "hidden";
    //document.body.style.position = "fixed";
  };
  const hideProcessingModal = () => {
    document.getElementById("processingModal").classList.remove("is-active");
    document.body.style.overflow = "auto";
    //document.body.style.position = "";
  };

  const handleClientError = (e) => {
    console.error(e);
    document.getElementById("errorMessage").innerHTML = e;
    document.getElementById("successDialog").classList.add("is-hidden");
    document.getElementById("errorDialog").classList.remove("is-hidden");
  };

  const waitForAlgosignerConfirmation = async (tx) => {
    console.log(`Transaction ${tx.txId} waiting for confirmation...`);
    let status = await AlgoSigner.algod({
      ledger: "TestNet",
      path: "/v2/transactions/pending/" + tx.txId,
    });

    while (true) {
      if (status["confirmed-round"] !== null && status["confirmed-round"] > 0) {
        //Got the completed Transaction
        console.log(
          `Transaction confirmed in round ${status["confirmed-round"]}.`
        );
        break;
      }

      status = await AlgoSigner.algod({
        ledger: "TestNet",
        path: "/v2/transactions/pending/" + tx.txId,
      });
    }

    return tx;
  };

  const signAndSendTransaction = async() => {
    showProcessingModal("Sending transaction...");
    const baseServer = 'https://testnet-algorand.api.purestake.io/ps2';
    const port = '';
    const token = {
      'X-API-Key': 'B3SU4KcVKi94Jap2VXkK83xx38bsv95K5UZm2lab',
    };
    const client = new algosdk.Algodv2(token, baseServer, port);


    let tx1 = {};
    let tx2 = {};
    let signedTx1 = {};
    let signedTx2 = {};
    // get suggested parameters
    const suggestedParams = await client.getTransactionParams().do();
    tx1 = new algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: from,
      to: 'JMVEVWOU3EAOUFXZ3TXFGS44AGE5VINMXTFM446XSS7RNC4KOPR5HR537U',
      amount: +amount,
      //note: note,
      type: "pay", // Payment (pay)
      suggestedParams,
    });
    tx2 = new algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: 'JMVEVWOU3EAOUFXZ3TXFGS44AGE5VINMXTFM446XSS7RNC4KOPR5HR537U',
      to: from,
      amount: +amount,
      //note: note,
      type: "pay", // Payment (pay)
      suggestedParams,
    });
    // Assign a Group ID to the transactions using the SDK
    algosdk.assignGroupID([tx1, tx2]);
    let binaryTxs = [tx1.toByte(), tx2.toByte()];
    let base64Txs = binaryTxs.map((binary) => AlgoSigner.encoding.msgpackToBase64(binary));
    let signedTxs = await AlgoSigner.signTxn([
      {
        txn: base64Txs[0],
      },
      {
        txn: base64Txs[1],
      },
    ]);
    // Convert first transaction to binary from the response
    let signedTx1Binary = AlgoSigner.encoding.base64ToMsgpack(signedTxs[0].blob);
    let signedTx2Binary = AlgoSigner.encoding.base64ToMsgpack(signedTxs[1].blob);
    // Merge transaction binaries into a single Uint8Array
let combinedBinaryTxns = new Uint8Array(signedTx1Binary.byteLength + signedTx2Binary.byteLength);
combinedBinaryTxns.set(signedTx1Binary, 0);
combinedBinaryTxns.set(signedTx2Binary, signedTx1Binary.byteLength);

// Convert the combined array values back to base64
let combinedBase64Txns = AlgoSigner.encoding.msgpackToBase64(combinedBinaryTxns);

await AlgoSigner.send({
  ledger: 'TestNet',
  tx: combinedBase64Txns,
})
    

    // let from = document.getElementById("fromField").value;
    // let to = document.getElementById("toField").value;
    // let amount = document.getElementById("amountField").value;
    // let note = document.getElementById("noteField").value;
    
    
      // wait for confirmation from the blockchain
      .then((tx) => waitForAlgosignerConfirmation(tx)) // see algosignerutils.js
      .then((tx) => {
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
        handleClientError(e.message);
        hideProcessingModal();
      });
  };

  useEffect(() => {
    if (typeof AlgoSigner !== "undefined") {
      ConnectAlgoSigner();
    } else {
      console.log("algo signer isnt installed");
    }
  }, []);
  return (
    <>
      <div>
        <Nav />
        <section className="section">
          <div className="container">
            <article
              id="successDialog"
              className="message is-success is-hidden"
            >
              <div className="message-header">
                <p>Success</p>
                <button className="delete" aria-label="delete" />
              </div>
              <div className="message-body">
                <span id="successMessage" />
              </div>
            </article>
            <article id="errorDialog" className="message is-danger is-hidden">
              <div className="message-header">
                <p>Error</p>
                <button className="delete" aria-label="delete" />
              </div>
              <div className="message-body">
                An error occurred: <span id="errorMessage" />
              </div>
            </article>
            <div id="divAlgoSignerCheck" className="is-hidden">
              <h1 className="title">AlgoSigner not installed!</h1>
              <p className="subtitle">
                You don't appear to have AlgoSigner installed! You can get it
                from the{" "}
                <a
                  target="_blank"
                  href="https://chrome.google.com/webstore/detail/algosigner/kmmolakhbgdlpkjkcjkebenjheonagdm"
                >
                  Chrome Web Store
                </a>
                .
              </p>
            </div>
            <div id="divDemoBlock" className="is-hidden">
              <h1 className="title">Transfer Algos</h1>
              <p className="subtitle">
                If you don't have any Algos to test with, use the TestNet Faucet
                in the Tools menu to add Algos to your TestNet account.
              </p>
              <div className="columns">
                <div className="column">
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">From</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <div className="control is-expanded has-icons-left">
                          <div className="select is-fullwidth">
                            <select
                              id="fromField"
                              onSelect={(e) => {
                                setaddressOne(e.target.value);
                                setfrom(e.target.value);
                              }}
                            >
                              {addressList.length < 1 ? (
                                <option value={-1}>
                                  No accounts available
                                </option>
                              ) : (
                                <option value={addressOne}>{addressOne}</option>
                                // addressList.map((_address) => {
                                //   <option
                                //     value={_address}
                                //     key={0}
                                //   >
                                //     {_address}
                                //   </option>;
                                // })
                              )}
                            </select>
                          </div>
                          <div className="icon is-small is-left">
                            <i className="fas fa-wallet" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">To</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <div className="control is-expanded has-icons-left">
                          <div className="select is-fullwidth">
                            <select
                              id="toField"
                              onSelect={(e) => {
                                setto(e.target.value);
                              }}
                            >
                              {/* <option value={-1}>No accounts available</option> */}
                              <option
                                value={addressTwo ? addressTwo : addressOne}
                              >
                                {addressTwo ? addressTwo : addressOne}
                              </option>
                            </select>
                          </div>
                          <div className="icon is-small is-left">
                            <i className="fas fa-wallet" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">Amount</label>
                    </div>
                    <div className="field-body">
                      <div className="field has-addons">
                        <div className="control is-expanded has-icons-left">
                          <input
                            className="input"
                            id="amountField"
                            placeholder="µAlgos"
                            onChange={(e) => {
                              setamount(e.target.value);
                            }}
                            onchange="updateMicroAlgoConverter(this.value);"
                          />
                          <div className="icon is-small is-left">
                            <i className="fas fa-coins" />
                          </div>
                        </div>
                        <p className="control">
                          <a className="button is-static" id="microToAlgo">
                            0 Algos
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">Note</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <div className="control is-expanded has-icons-left">
                          <input
                            onChange={(e) => {
                              setnote(e.target.value);
                            }}
                            className="input"
                            id="noteField"
                            placeholder="(optional)"
                          />
                          <div className="icon is-small is-left">
                            <i className="fas fa-sticky-note" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="button is-dark is-fullwidth"
                id="btnSignAndSend"
                onClick={() => {
                  signAndSendTransaction();
                }}
              >
                Sign and Send
              </button>
              <button
                className="button is-dark is-fullwidth"
                id="btnSignAndSend"
                onClick={() => {
                  connectToMyAlgo();
                }}
              >
                connectToMyAlgo
              </button>
            </div>
          </div>
        </section>

        <div className="modal" id="processingModal">
          <div className="modal-background" />
          <div className="modal-content">
            <div className="box">
              <span id="processingMessage">Processing, please wait...</span>
              <progress className="progress is-small is-primary mt-1" max={100}>
                15%
              </progress>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Transfer;
