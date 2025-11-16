import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { openAuthModal } from './authSlice';

const API_URL = "http://localhost:8080";

// ===================== THUNKS =====================

// Obtiene o crea la lista
export const getFavoriteList = createAsyncThunk(
  "wishlist/getList",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) return rejectWithValue("No autenticado");

      const { data } = await axios.get(
        `${API_URL}/api/favorite-list/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return data.id;
    } catch (err) {
      if (err.response?.status === 404) {
        // Mostrar modal login
        dispatch(openAuthModal());
        return null;
      }

      return rejectWithValue(err.message);
    }
  }
);

// Carga los favoritos
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("No autenticado");

      const { data } = await axios.get(
        `${API_URL}/api/favorite-list/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return data.products.map((p) => p.id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Agrega o quita favoritos
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (productId, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) return rejectWithValue("No autenticado");

      // Refresh server-side wishlist to avoid stale local state
      const fetchRes = await dispatch(fetchWishlist(userId));
      const currentItems = fetchRes.payload || [];
      const isInWishlist = currentItems.includes(productId);

      // Ensure we have a favorite list id; ask the server for it (backend manages creation)
      const res = await dispatch(getFavoriteList());
      const listId = res.payload;
      if (!listId) return rejectWithValue("Lista no disponible");

      if (isInWishlist) {
        await axios.delete(`${API_URL}/api/favorite-list/${listId}/product-delete/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.put(`${API_URL}/api/favorite-list/${listId}/product-add`, { id: productId }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      }

      // Return the previous membership so reducer can toggle correctly
      return { productId, isInWishlist };
    } catch (err) {
      // If backend replies with BAD_REQUEST because product already in list / not in list,
      // refresh the client state and return a neutral rejection so UI can update.
      if (err.response?.status === 400) {
        try {
          const userId = getState().auth.user?.id;
          await dispatch(fetchWishlist(userId));
          return rejectWithValue("Bad request: operación inválida en la lista de favoritos");
        } catch (inner) {
          return rejectWithValue(inner.message || "Error al sincronizar favoritos");
        }
      }

      // If the favorite list endpoint returned 404 (no lista), ask to open auth modal as fallback
      if (err.response?.status === 404) {
        dispatch(openAuthModal());
        return rejectWithValue("Lista de favoritos no encontrada");
      }

      return rejectWithValue(err.message);
    }
  }
);

// ===================== SLICE =====================

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // TOGGLE
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, isInWishlist } = action.payload;

        if (isInWishlist) {
          state.items = state.items.filter((id) => id !== productId);
        } else {
          state.items.push(productId);
        }
      })

      // GET LIST ID
      .addCase(getFavoriteList.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearWishlistError } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsInWishlist = (id) => (state) =>
  state.wishlist.items.includes(id);

export default wishlistSlice.reducer;
