import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { useHuddle01 } from "@huddle01/react";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Wallet01 } from "@wallet01/react";
import { PhantomConnector } from "@wallet01/solana";
import { DEVNET_RPC } from "@/util/constants";

export default function App({ Component, pageProps }: AppProps) {
  const { initialize, me } = useHuddle01();

  useEffect(() => {
    initialize(process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID as string);
  }, []);

  return (
    <ChakraProvider>
      <Wallet01
        autoConnect={true}
        connectors={() => [new PhantomConnector({ rpcUrl: DEVNET_RPC })]}
      >
        <Component {...pageProps} />
      </Wallet01>
    </ChakraProvider>
  );
}
