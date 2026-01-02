
import { Route, Switch } from "wouter";
import { useSearch } from 'wouter/use-browser-location';
import { Toaster } from "react-hot-toast";

import ErrorBoundary from "@/components/ErrorBoundary";

import { Home } from "@/pages/Home";
import { ComputerPage } from "./pages/Computer";
import NotFound from "@/pages/NotFound";

import '@/App.css';


function App() {
    const search = useSearch();
    const params = new URLSearchParams(search);

    const chunkId: string | null = params.get('chunk') || null;
    const useMockDB = !!params.get('mock');

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
            <Route path={"/404"} component={NotFound} />
            {/* Final fallback route */}
            <Route component={NotFound} />
        </Switch>
    );
}


export default App;
