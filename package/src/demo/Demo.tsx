
import React from "react";
import { Route, Switch } from "wouter";

import { Home } from "./pages/Home";
import { CompilePage } from "./pages/CompilePage";
import { ComputerPage } from "./pages/ComputerPage";


export const Demo: React.FC = () => {
    return (
        <>
            <Router />
        </>
    );
}


const Router: React.FC = () => {
    return (
        <Switch>
            <Route path={"/"} component={Home} />
            <Route path={"/cpu"} component={ComputerPage} />
            <Route path={"/compiler"} component={CompilePage} />
        </Switch>
    );
}
