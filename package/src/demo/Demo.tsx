
import React from "react";
import { Route, Switch } from "wouter";

import { Home } from "./pages/Home";
import { CompilePage } from "./pages/CompilePage";
import { ComputerPage } from "./pages/ComputerPage";
import { TestV3Page } from "./pages/TestV3Page";


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
            <Route path={"/test-v3"} component={TestV3Page} />
        </Switch>
    );
}
