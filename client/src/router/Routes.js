import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Navbar, Footer } from "../components";
import {
  Home,
  Error,
  BuyItems,
  CreateItems,
  Profile,
  Resell,
  ItemsCreated,
} from "../pages";

const Routes = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/create-items" exact component={CreateItems} />
        <Route path="/buy-items" exact component={BuyItems} />
        <Route path="/profile" exact component={Profile} />
        <Route path="/resell" exact component={Resell} />
        <Route path="/items-created" exact component={ItemsCreated} />

        <Route component={Error} />
      </Switch>
      <Footer />
    </BrowserRouter>
  );
};

export default Routes;
