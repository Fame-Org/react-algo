import React from "react";

const Nav = () => {
  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item" href="https://algorand.com">
          <img
            src="static/img/algorand_logo_mark_black.svg"
            style={{ height: "100px" }}
          />
        </a>
        <a
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="algoDemoNavbar"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>
      <div id="algoDemoNavbar" className="navbar-menu">
        <div className="navbar-start">
          <a className="navbar-item" href="index.html">
            Introduction
          </a>
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">Transactions</a>
            <div className="navbar-dropdown">
              <a className="navbar-item" href="algo-transfer.html">
                ALGO Transfer
              </a>
              <a className="navbar-item" href="asa-transfer.html">
                ASA Transfer
              </a>
              <a className="navbar-item" href="asset-creation.html">
                Asset Creation
              </a>
              <a className="navbar-item" href="atomic-transfer.html">
                Atomic Transfer
              </a>
            </div>
          </div>
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">Smart Contracts</a>
            <div className="navbar-dropdown">
              <a className="navbar-item" href="limit-order.html">
                Limit Order Contract
              </a>
              <a className="navbar-item" href="hash-time-lock.html">
                Hash Time Lock Contract
              </a>
              <a className="navbar-item" href="split-contract.html">
                Split Contract
              </a>
            </div>
          </div>
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">Tools</a>
            <div className="navbar-dropdown">
              <a
                className="navbar-item"
                target="_blank"
                href="https://testnet.algoexplorer.io/dispenser"
              >
                TestNet ALGO Faucet
              </a>
            </div>
          </div>
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <button className="button is-info" id="btnRefreshAccounts">
              Refresh Accounts
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
