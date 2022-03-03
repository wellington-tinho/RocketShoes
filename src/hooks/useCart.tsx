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
        
        
        if(cart.find(product=> product.id === productId)){

          const updateCart:Product[] = cart.map((element) => {
            if(element.id===productId){

              if (qtdProductStock >= element.amount + 1){
                element.amount = element.amount + 1
              }else{
                toast.error('Quantidade solicitada fora de estoque');
              }
                return element
            } 
            return element;
          }) 
          setCart(updateCart);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))


        }else{

          newProduct.amount = 1
          const updateCart = [...cart, newProduct]
          setCart(updateCart) 

          console.log('cart',cart);
          console.log('[...cart, newProduct]',[...cart, newProduct]);
          console.log('newProduct',newProduct);
          
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
        }
  

        
      } catch { 
        toast.error('Erro na adição do produto');
      }
    };

  const removeProduct = (productId: number) => {
    

    try {
      const updateCart = cart.filter( product =>  product.id !== productId)
      setCart(
        updateCart
      )
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    const responseGetStock = await api.get<Stock>(`stock/${productId}`);
    const qtdProductStock = responseGetStock.data.amount
    try {
      const updateCart =  cart.map((product) => {
        if(product.id === productId){
            if (qtdProductStock >= amount){     
              product.amount = amount
            }else{
              toast.error('Quantidade solicitada fora de estoque');
            }
          return product
        }
        return product
      })
      setCart(
        updateCart
      )
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
    } catch {
      toast.error('Erro na adição do produto');
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
