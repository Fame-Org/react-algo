import React from "react";
const AlgoNotInstalled = () => {
  return (
    <div id="divAlgoSignerCheck">
      <h1 class="title">AlgoSigner not installed!</h1>
      <p class="subtitle">
        You don't appear to have AlgoSigner installed! You can get it from the{" "}
        <a
          target="_blank"
          href="https://chrome.google.com/webstore/detail/algosigner/kmmolakhbgdlpkjkcjkebenjheonagdm"
        >
          Chrome Web Store
        </a>
        .
      </p>
    </div>
  );
};

export default AlgoNotInstalled;
