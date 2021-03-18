import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const stockId = await api.get(`stock/${productId}`);
      const product = await api.get("products");
      const productExist = product.data.find(
        (p: Product) => p.id === productId
      );

      //stock
      const stockAmount = stockId.data.amount;
      const currentAmount = productExist ? productExist.amount : 0;
      const amount = currentAmount + 1;

      const cart = {
        ...productExist,
        amount: 1,
      };
      setCart(cart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));

      // console.log(stock);
      //const stockAmount = stock.amount;

      //const currentAmount = 0;

      // const amount = currentAmount + 1;
      // console.log(amount);
      // if (amount > stockAmount) {
      //   console.log("erro");
      // }
    } catch (err) {
      console.log(err);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch (err) {
      console.log(err);
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
