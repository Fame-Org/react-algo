import { Routes, BrowserRouter, Route } from "react-router-dom";

import React from "react";
import Transfer from "../pages/transfer";
import Swap from "../pages/swap";

const Router = () => {


  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/swap" element={Swap}></Route>
        <Route path="/transfer" element={Transfer}></Route>
        <Route path="/" element={Swap}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
