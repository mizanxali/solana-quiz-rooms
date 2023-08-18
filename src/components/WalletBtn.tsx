import { useClient, useConnect, useWallet } from "@wallet01/react";

function WalletBtn() {
  const { connect } = useConnect();
  const { address, disconnect } = useWallet();
  const { connectors } = useClient();

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.name}
          onClick={() => {
            connect({ connector });
          }}
        >
          {address ?? "Connect"}
        </button>
      ))}
      {address && <button onClick={() => disconnect()}>Disconnect</button>}
    </div>
  );
}

export default WalletBtn;
