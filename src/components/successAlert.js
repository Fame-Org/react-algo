import React from "react";

const SuccessAlert = () => {
  return (
    <>
      <article id="successDialog" class="message is-success is-hidden">
        <div class="message-header">
          <p>Success</p>
          <button class="delete" aria-label="delete"></button>
        </div>
        <div class="message-body">
          <span id="successMessage"></span>
        </div>
      </article>
    </>
  );
};

export default SuccessAlert;
