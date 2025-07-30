import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Carregar carrinho do localStorage ou Firebase
  useEffect(() => {
    if (currentUser) {
      loadCartFromFirebase();
    } else {
      loadCartFromLocalStorage();
    }
  }, [currentUser]);

  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const loadCartFromFirebase = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists() && userDoc.data().cart) {
        setCart(userDoc.data().cart);
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    }
  };

  const saveCart = async (newCart) => {
    if (currentUser) {
      try {
        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            cart: newCart,
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Erro ao salvar carrinho:", error);
      }
    } else {
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  const addToCart = async (product, size, quantity = 1) => {
    // Garante que sempre exista o array images
    let images = [];
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      images = product.images;
    } else if (product.image) {
      images = [product.image];
    }

    const existingItem = cart.find(
      (item) => item.id === product.id && item.size === size
    );

    let newCart;
    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          images,
          size,
          quantity,
        },
      ];
    }

    setCart(newCart);
    await saveCart(newCart);
  };

  const removeFromCart = async (productId, size) => {
    const newCart = cart.filter(
      (item) => !(item.id === productId && item.size === size)
    );
    setCart(newCart);
    await saveCart(newCart);
  };

  const updateQuantity = async (productId, size, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId, size);
      return;
    }

    const newCart = cart.map((item) =>
      item.id === productId && item.size === size ? { ...item, quantity } : item
    );
    setCart(newCart);
    await saveCart(newCart);
  };

  const clearCart = async () => {
    setCart([]);
    await saveCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const generateOrder = async (customerData) => {
    setLoading(true);
    try {
      const orderData = {
        items: cart,
        total: getTotalPrice(),
        customer: customerData,
        createdAt: new Date(),
        status: "pending",
      };

      if (currentUser) {
        orderData.userId = currentUser.uid;
      }

      const orderRef = await addDoc(collection(db, "orders"), orderData);

      if (currentUser) {
        // Salvar pedido no perfil do usuário
        const userOrders = await getDoc(doc(db, "users", currentUser.uid));
        const existingOrders = userOrders.exists()
          ? userOrders.data().orders || []
          : [];
        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            orders: [...existingOrders, orderRef.id],
          },
          { merge: true }
        );
      }

      return orderRef.id;
    } catch (error) {
      console.error("Erro ao gerar pedido:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    generateOrder,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
