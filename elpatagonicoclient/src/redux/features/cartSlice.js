import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"
const CART_URL = `${API_URL}/api/cart`

// Helper para mapear items del carrito
const mapToCartItems = (data) => {
  if (!Array.isArray(data)) {
    console.warn("[cartSlice] data is not an array:", data)
    return []
  }

  return data.map((item) => ({
    id: item.product,
    productName: item.name || `Producto ${item.product}`,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    finalPrice: item.totalPrice,
    image: item.imagesURL?.[0] || item.image?.id || null,
  }))
}

// Async thunks
export const fetchCartItems = createAsyncThunk("cart/fetchItems", async ({ userId, token }, { rejectWithValue }) => {
  try {
    console.log(`[cartSlice] Fetching cart items for user ${userId}...`)

    const response = await fetch(`${CART_URL}/items/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log(`[cartSlice] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[cartSlice] Error response:`, errorText)
      throw new Error(`No se pudo cargar el carrito. Status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[cartSlice] Cart data received:`, data)

    return mapToCartItems(data)
  } catch (error) {
    console.error("[cartSlice] Error fetching cart:", error)
    return rejectWithValue(error.message)
  }
})

export const fetchCartTotal = createAsyncThunk("cart/fetchTotal", async ({ userId, token }, { rejectWithValue }) => {
  try {
    console.log(`[cartSlice] Fetching cart total for user ${userId}...`)

    const response = await fetch(`${CART_URL}/total/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log(`[cartSlice] Total response status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`Error al obtener total. Status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ [cartSlice] Total received:`, data)

    return data
  } catch (error) {
    console.error("[cartSlice] Error fetching total:", error)
    return rejectWithValue(error.message)
  }
})

export const addToCart = createAsyncThunk(
  "cart/addItem",
  async ({ userId, productId, quantity = 1, token }, { dispatch, rejectWithValue }) => {
    try {
      console.log(`[cartSlice] Adding to cart:`, { productId, quantity, userId })

      const response = await fetch(`${CART_URL}/addItem/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: productId, quantity }),
      })

      console.log(`[cartSlice] Add response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[cartSlice] Error response:`, errorText)
        throw new Error(`Error ${response.status} en la acción del carrito.`)
      }

      const responseData = await response.text()
      console.log(`[cartSlice] Add successful:`, responseData)

      // Refrescar carrito
      await dispatch(fetchCartItems({ userId, token }))
      await dispatch(fetchCartTotal({ userId, token }))

      return true
    } catch (error) {
      console.error("[cartSlice] Error adding to cart:", error)
      return rejectWithValue(error.message)
    }
  },
)

export const removeFromCart = createAsyncThunk(
  "cart/removeItem",
  async ({ userId, productId, token }, { dispatch, rejectWithValue }) => {
    try {
      console.log(`[cartSlice] Removing from cart:`, { productId, userId })

      const response = await fetch(`${CART_URL}/removeItem/${userId}/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log(`[cartSlice] Remove response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[cartSlice] Error response:`, errorText)
        throw new Error(`Error ${response.status} en la acción del carrito.`)
      }

      const responseData = await response.text()
      console.log(`[cartSlice] Remove successful:`, responseData)

      // Refrescar carrito
      await dispatch(fetchCartItems({ userId, token }))
      await dispatch(fetchCartTotal({ userId, token }))

      return true
    } catch (error) {
      console.error("[cartSlice] Error removing from cart:", error)
      return rejectWithValue(error.message)
    }
  },
)

export const incrementQuantity = createAsyncThunk(
  "cart/incrementQuantity",
  async ({ userId, productId, token }, { dispatch, rejectWithValue }) => {
    try {
      console.log(`[cartSlice] Incrementing quantity for product ${productId}`)

      const response = await fetch(`${CART_URL}/addItem/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: productId, quantity: 1 }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      console.log(`[cartSlice] Increment successful`)

      // Refrescar carrito
      await dispatch(fetchCartItems({ userId, token }))
      await dispatch(fetchCartTotal({ userId, token }))

      return true
    } catch (error) {
      console.error("[cartSlice] Error incrementing:", error)
      return rejectWithValue(error.message)
    }
  },
)

export const decrementQuantity = createAsyncThunk(
  "cart/decrementQuantity",
  async ({ userId, productId, quantity, token }, { dispatch, rejectWithValue }) => {
    try {
      console.log(`[cartSlice] Decrementing quantity for product ${productId}`)

      if (quantity <= 1) {
        return await dispatch(removeFromCart({ userId, productId, token }))
      }

      // Eliminar y volver a agregar con cantidad - 1
      const removeResponse = await fetch(`${CART_URL}/removeItem/${userId}/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!removeResponse.ok) {
        throw new Error(`Error ${removeResponse.status}`)
      }

      const addResponse = await fetch(`${CART_URL}/addItem/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: productId, quantity: quantity - 1 }),
      })

      if (!addResponse.ok) {
        throw new Error(`Error ${addResponse.status}`)
      }

      console.log(`[cartSlice] Decrement successful`)

      // Refrescar carrito
      await dispatch(fetchCartItems({ userId, token }))
      await dispatch(fetchCartTotal({ userId, token }))

      return true
    } catch (error) {
      console.error("[cartSlice] Error decrementing:", error)
      return rejectWithValue(error.message)
    }
  },
)

export const clearCart = createAsyncThunk("cart/clear", async ({ userId, token }, { rejectWithValue }) => {
  try {
    console.log(`[cartSlice] Clearing cart for user ${userId}`)

    const response = await fetch(`${CART_URL}/clearCart/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log(`[cartSlice] Clear response status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }

    console.log(`[cartSlice] Cart cleared`)

    return true
  } catch (error) {
    console.error("[cartSlice] Error clearing cart:", error)
    return rejectWithValue(error.message)
  }
})

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalAmount: 0.0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCartError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Items
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Total
      .addCase(fetchCartTotal.fulfilled, (state, action) => {
        state.totalAmount = action.payload
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
        state.totalAmount = 0.0
      })
      // Add Item
      .addCase(addToCart.pending, (state) => {
        state.loading = true
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Remove Item
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearCartError } = cartSlice.actions

// Selectors
export const selectCartItems = (state) => state.cart.items
export const selectCartTotal = (state) => state.cart.totalAmount
export const selectCartLoading = (state) => state.cart.loading
export const selectCartError = (state) => state.cart.error

export default cartSlice.reducer
