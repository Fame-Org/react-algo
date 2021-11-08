import React from "react";

const LoadingModal = () => {
  return (
    <>
      <div class="modal" id="processingModal">
        <div class="modal-background"></div>
        <div class="modal-content">
          <div class="box">
            <span id="processingMessage">Processing, please wait...</span>
            <progress class="progress is-small is-primary mt-1" max="100">
              15%
            </progress>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingModal;
