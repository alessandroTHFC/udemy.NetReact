import { createContext, PropsWithChildren, useContext, useState } from "react";
import { Basket } from "../layout/models/basket";

//* Declaring interface for StoreContextValue
//* the interface is a "what to expect" structure.
interface StoreContextValue {
  basket: Basket | null;
  setBasket: (basket: Basket) => void;
  removeItem: (productId: number, quantity: number) => void;
}

//* creating a StoreContext based off of the framework the interface provides
export const StoreContext = createContext<StoreContextValue | undefined>(
  undefined
);

//* Function to export our store context across other functional components
export function useStoreContext() {
  const context = useContext(StoreContext);

  if (context === undefined) {
    throw Error("Oops we are not inside the provider");
  }

  return context;
}

export function StoreProvider({ children }: PropsWithChildren<any>) {
  const [basket, setBasket] = useState<Basket | null>(null);

  function removeItem(productId: number, quantity: number) {
    if (!basket) return;

    const items = [...basket.items];
    const itemIndex = items.findIndex((i) => i.productId === productId);

    if (itemIndex >= 0) {
      items[itemIndex].quantity -= quantity;
      if (items[itemIndex].quantity === 0) items.splice(itemIndex, 1);

      setBasket((prevState) => {
        return { ...prevState!, items };
      });
    }
  }

  return (
    <StoreContext.Provider value={{ basket, setBasket, removeItem }}>
      {children}
    </StoreContext.Provider>
  );
}
