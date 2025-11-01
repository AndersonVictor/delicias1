"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (producto, cantidad = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === producto.id);
      
      if (existingItem) {
        // Si el producto ya existe, actualizar cantidad
        return prevItems.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        // Si es un producto nuevo, agregarlo
        return [...prevItems, { ...producto, cantidad }];
      }
    });
  };

  const removeFromCart = (productoId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productoId));
  };

  const updateQuantity = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      removeFromCart(productoId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.precio) * item.cantidad);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.cantidad, 0);
  };

  const getCartItem = (productoId) => {
    return cartItems.find(item => item.id === productoId);
  };

  const isInCart = (productoId) => {
    return cartItems.some(item => item.id === productoId);
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const openCart = () => {
    setIsOpen(true);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  // Validar stock antes de agregar al carrito
  const canAddToCart = (producto, cantidadDeseada = 1) => {
    const itemEnCarrito = getCartItem(producto.id);
    const cantidadActual = itemEnCarrito ? itemEnCarrito.cantidad : 0;
    const cantidadTotal = cantidadActual + cantidadDeseada;
    
    return cantidadTotal <= producto.stock;
  };

  // Obtener productos para el pedido (formato para API)
  const getOrderItems = () => {
    return cartItems.map(item => ({
      producto_id: item.id,
      cantidad: item.cantidad,
      precio_unitario: parseFloat(item.precio)
    }));
  };

  const value = {
    cartItems,
    isOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCartItem,
    isInCart,
    toggleCart,
    openCart,
    closeCart,
    canAddToCart,
    getOrderItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};