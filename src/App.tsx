
import { Route, Switch } from "wouter";
import { useSearch } from 'wouter/use-browser-location';
import { Toaster } from "react-hot-toast";

import ErrorBoundary from "@/components/ErrorBoundary";

import { Home } from "@/pages/Home";
import { ComputerPage } from "./pages/Computer";
import { CompilePage } from "./pages/CompilePage";
import NotFound from "@/pages/NotFound";

import '@/App.css';
import { useEffect, useState } from "react";
import { ComputerBeta } from "./pages/ComputerBeta";


function App() {
    //console.log('RENDER App')

    return (
        <ErrorBoundary>
            <Router />

            <Toaster
                toastOptions={{
                    style: {
                        background: 'hsl(var(--color-background))',
                        color: 'hsl(var(--color-foreground))',
                        border: '1px solid hsl(var(--border))',
                    },
                    position: 'bottom-right',
                }}
                containerStyle={{
                    marginBottom: '80px',
                }}
            />
        </ErrorBoundary>
    );
}


function Router() {
    return (
        <Switch>
            <Route path={"/"} component={Home} />
            <Route path={"/cpu"} component={ComputerPage} />
            <Route path={"/cpu-beta"} component={ComputerBeta} />
            <Route path={"/compiler"} component={CompilePage} />
            <Route path={"/404"} component={NotFound} />
            {/* Final fallback route */}
            <Route component={NotFound} />
        </Switch>
    );
}


export default App;
