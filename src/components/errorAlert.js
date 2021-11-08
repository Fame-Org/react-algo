import React from "react";

const ErrorAlert = () => {
  return (
    <>
      <article id="errorDialog" class="message is-danger is-hidden">
        <div class="message-header">
          <p>Error</p>
          <button class="delete" aria-label="delete"></button>
        </div>
        <div class="message-body">
          An error occurred: <span id="errorMessage"></span>
        </div>
      </article>
    </>
  );
};

export default ErrorAlert;
