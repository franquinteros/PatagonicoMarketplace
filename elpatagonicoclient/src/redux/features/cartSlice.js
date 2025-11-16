import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8080";

// ===================== HELPERS =====================

const mapToCartItems = (data) => {
  if (!Array.isArray(data)) {
    console.warn("[cartSlice] data is not an array:", data);
    return [];
  }

  return data.map((item) => ({
    id: item.product,           // ID del producto
    productId: item.product,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    finalPrice: item.totalPrice,

    // Datos que NO vienen del backend → valores placeholder
    productName: `Producto ${item.product}`,
    image: null,
  }));
};

// ===================== THUNKS =====================

// Get cart items
export const fetchCartItems = createAsyncThunk(
  "cart/fetchItems",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) return rejectWithValue("Usuario no autenticado");

      const { data } = await axios.get(`${API_URL}/api/cart/items/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return mapToCartItems(data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get total
export const fetchCartTotal = createAsyncThunk(
  "cart/fetchTotal",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) return rejectWithValue("Usuario no autenticado");

      const { data } = await axios.get(`${API_URL}/api/cart/total/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add item
export const addToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId, quantity = 1 }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;

      if (!token || !userId) return rejectWithValue("Usuario no autenticado");

      await axios.put(
        `${API_URL}/api/cart/addItem/${userId}`,
        { product: productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await dispatch(fetchCartItems());
      await dispatch(fetchCartTotal());

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data ||
        error.message
      );
    }
  }
);

// Remove item
export const removeFromCart = createAsyncThunk(
  "cart/removeItem",
  async (productId, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) return rejectWithValue("Usuario no autenticado");

      await axios.put(
        `${API_URL}/api/cart/removeItem/${userId}/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await dispatch(fetchCartItems());
      await dispatch(fetchCartTotal());

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data || error.message
      );
    }
  }
);

// Increment quantity
export const incrementQuantity = createAsyncThunk(
  "cart/incrementQuantity",
  async (productId, { dispatch, rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) return rejectWithValue("Usuario no autenticado");

      // Backend expects the 'quantity' as the delta to add (can be negative to subtract).
      // Send a delta of +1 to increment.
      await axios.put(
        `${API_URL}/api/cart/addItem/${userId}`,
        { product: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await dispatch(fetchCartItems());
      await dispatch(fetchCartTotal());

      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Decrement quantity
export const decrementQuantity = createAsyncThunk(
  "cart/decrementQuantity",
  async (productId, { dispatch, rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) return rejectWithValue("Usuario no autenticado");

      const currentItem = getState().cart.items.find((it) => it.id === productId);
      const currentQty = currentItem?.quantity ?? 0;

      if (currentQty <= 1) {
        return dispatch(removeFromCart(productId));
      }

      // Send a delta of -1 to decrement (backend will subtract and update totalPrice).
      await axios.put(
        `${API_URL}/api/cart/addItem/${userId}`,
        { product: productId, quantity: -1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await dispatch(fetchCartItems());
      await dispatch(fetchCartTotal());

      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) return rejectWithValue("Usuario no autenticado");

      await axios.delete(`${API_URL}/api/cart/clearCart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ===================== SLICE =====================

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalAmount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCartTotal.fulfilled, (state, action) => {
        state.totalAmount = action.payload;
      })

      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(incrementQuantity.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(decrementQuantity.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// SELECTORS
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.totalAmount;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export const { clearCartError } = cartSlice.actions;

export default cartSlice.reducer;
