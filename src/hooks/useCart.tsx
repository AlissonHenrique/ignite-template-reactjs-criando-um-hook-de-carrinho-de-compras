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

      const productExist = cart.find((p: Product) => p.id === productId);

      const stockAmount = stockId.data.amount;
      const currentAmount = productExist ? productExist.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
      }
      if (!productExist) {
        const product = await api.get(`products/${productId}`);
        const cartNew = {
          ...product.data,
          amount: 1,
        };

        setCart([...cart, cartNew]);
        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify([...cart, cartNew])
        );
      } else {
        updateProductAmount({ productId, amount });
      }
    } catch (err) {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // const remove = cart.filter((remove) => remove.id !== productId);
      const findRemove = cart.find((remove) => remove.id === productId);
      if (!findRemove) {
        toast.error("Erro na remoção do produto");
      } else {
        setCart(cart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) return;
      const stock = await api.get(`stock/${productId}`);
      const stockAmount = stock.data.amount;

      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
      } else {
        const productOnCart = cart.find((product) => product.id === productId);
        if (productOnCart) {
          productOnCart.amount = amount;

          localStorage.setItem("@RocketShoes:cart", JSON.stringify([...cart]));
          setCart([...cart]);
        }
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
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
