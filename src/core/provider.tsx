import { createContext, useContext, useEffect } from "react";
import type { PropsWithChildren } from "react";
import type { SparePartsClient } from "./module";

const Context = createContext<SparePartsClient | null>(null);

export function SparePartsProvider({ client, children }: PropsWithChildren<{ client: SparePartsClient }>) {
  useEffect(() => { void client.activate(); return () => { void client.dispose(); }; }, [client]);
  return <Context.Provider value={client}>{children}</Context.Provider>;
}

export function useSpareParts(): SparePartsClient {
  const client = useContext(Context);
  if (!client) throw new Error("useSpareParts must be used inside SparePartsProvider");
  return client;
}
