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
        // Limpar dados undefined antes de salvar
        const cleanCart = newCart.map((item) => ({
          id: item.id || "",
          name: item.name || "",
          price: item.price || 0,
          image: item.image || "",
          images: item.images || [],
          size: item.size || "",
          quantity: item.quantity || 0,
          selectedColor: item.selectedColor || "",
          customizationDetails: item.customizationDetails || [],
        }));

        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            cart: cleanCart,
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
          id: product.id || "",
          name: product.name || "",
          price: product.price || 0,
          image: product.image || "",
          images: images,
          size: size || "",
          quantity: quantity || 1,
          selectedColor: product.selectedColor || "",
          customizationDetails: product.customizationDetails || [],
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
      // Gerar ID único para o orçamento
      const orderId = `ORC-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      // Limpar dados undefined antes de salvar
      const cleanItems = cart.map((item) => ({
        id: item.id || "",
        name: item.name || "",
        price: item.price || 0,
        image: item.image || "",
        images: item.images || [],
        size: item.size || "",
        quantity: item.quantity || 0,
        selectedColor: item.selectedColor || "",
        customizationDetails: item.customizationDetails || [],
      }));

      const cleanCustomerData = {
        name: customerData?.name || "",
        email: customerData?.email || "",
        phone: customerData?.phone || "",
        company: customerData?.company || "",
        address: customerData?.address || "",
      };

      const orderData = {
        orderId,
        items: cleanItems,
        total: getTotalPrice(),
        customer: cleanCustomerData,
        createdAt: new Date(),
        status: "pending",
        deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        pdfGenerated: false,
      };

      if (currentUser) {
        orderData.userId = currentUser.uid;
        orderData.userEmail = currentUser.email || "";
        orderData.userName = currentUser.displayName || "";
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

      return orderId;
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
