import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

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
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
        if (storagedCart) {
          return JSON.parse(storagedCart);
        }
      return [];        
  });

    const addProduct = async (productId: number) => {
      
      try {
        const responseGetProducts = await api.get<Product>(`products/${productId}`);
        const newProduct = responseGetProducts.data

        const responseGetStock = await api.get<Stock>(`stock/${productId}`);
        const qtdProductStock = responseGetStock.data.amount
        
        const updatedCart = [...cart]
        const productCartIndex = updatedCart.findIndex(product =>  product.id === productId)
        
        if(productCartIndex >= 0 ){
          if(qtdProductStock >= updatedCart[productCartIndex].amount + 1){
            updatedCart[productCartIndex].amount = updatedCart[productCartIndex].amount + 1
            setCart(updatedCart);
            localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
          }else{
            toast.error('Quantidade solicitada fora de estoque');
          }

        }else{

          newProduct.amount = 1
          const updatedCart = [...cart, newProduct]
          setCart(updatedCart)  
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
        }
      } catch { 
        toast.error('Erro na adição do produto');
      }
    };

  const removeProduct = (productId: number) => {
  
    try {
      // const updatedCart = [...cart].filter( product =>  product.id !== productId)

      // if ((JSON.stringify(updatedCart)) === (JSON.stringify(cart))){
      //   throw new Error ("Produto não encontrado");
      // }
      // setCart( updatedCart )
      // localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))

      const updatedCart = [...cart]
      const productCartIndex = updatedCart.findIndex(product =>  product.id === productId)

      if(productCartIndex >= 0 ){

        updatedCart.splice(productCartIndex, 1)
        setCart(updatedCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))

      }else{
        throw new Error ("Produto não encontrado");
      }

  
      
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    if (amount < 1) return; 
    
    try {

      const responseGetStock = await api.get<Stock>(`stock/${productId}`);
      const qtdProductStock = responseGetStock.data.amount
      const updatedCart = [...cart]

      const productCartIndex = updatedCart.findIndex(product => product.id === productId) 
      
      if (productCartIndex >=0){
        if (qtdProductStock >= amount){     
          updatedCart[productCartIndex].amount = amount 
          setCart( updatedCart )
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))            
        }else{
          toast.error('Quantidade solicitada fora de estoque');
        }
      }else{
        toast.error('Erro na alteração de quantidade do produto');
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
