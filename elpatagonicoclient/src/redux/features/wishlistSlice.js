import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

// Helper para obtener o crear lista de favoritos
const getOrCreateFavoriteList = async (userId, token) => {
  try {
    console.log(` [wishlistSlice] Checking if favorite list exists for user ${userId}...`)

    const getResponse = await fetch(`${API_URL}/api/favorite-list/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log(` [wishlistSlice] Get list response status: ${getResponse.status}`)

    if (getResponse.ok) {
      const data = await getResponse.json()
      console.log(" [wishlistSlice] Favorite list data:", data)

      if (data && data.id) {
        console.log(" [wishlistSlice] List ID found:", data.id)
        return data.id
      }
    }

    if (getResponse.status === 404 || !getResponse.ok) {
      console.log(" [wishlistSlice] List not found, creating new one...")

      const createResponse = await fetch(`${API_URL}/api/favorite-list/create/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log(` [wishlistSlice] Create list response status: ${createResponse.status}`)

      if (createResponse.ok) {
        const newList = await createResponse.json()
        console.log(" [wishlistSlice] New favorite list created:", newList)
        return newList.id
      }
    }

    throw new Error("No se pudo obtener o crear la lista de favoritos")
  } catch (error) {
    console.error(" [wishlistSlice] Error getting/creating list:", error)
    throw error
  }
}

// Async thunks
export const fetchWishlist = createAsyncThunk("wishlist/fetch", async ({ userId, token }, { rejectWithValue }) => {
  try {
    console.log(` [wishlistSlice] Fetching wishlist for user ${userId}...`)

    const endpoint = `${API_URL}/api/favorite-list/user/${userId}`
    console.log(` [wishlistSlice] GET ${endpoint}`)

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log(` [wishlistSlice] Response status: ${response.status}`)

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(" [wishlistSlice] Wishlist not found (404), starting with empty list")
        return []
      }
      const errorText = await response.text()
      console.error(` [wishlistSlice] Error response:`, errorText)
      throw new Error(`Error ${response.status}: No se pudo obtener la lista de favoritos`)
    }

    const data = await response.json()
    console.log(" [wishlistSlice] Wishlist data received:", data)

    if (Array.isArray(data)) {
      const productIds = data.map((item) => item.id)
      console.log(" [wishlistSlice] Product IDs in wishlist:", productIds)
      return productIds
    } else if (data && data.products && Array.isArray(data.products)) {
      const productIds = data.products.map((item) => item.id)
      console.log(" [wishlistSlice] Product IDs in wishlist (from data.products):", productIds)
      return productIds
    } else {
      console.warn(" [wishlistSlice] Data is not an array:", data)
      return []
    }
  } catch (error) {
    console.error(" [wishlistSlice] Error fetching wishlist:", error)
    return rejectWithValue(error.message)
  }
})

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async ({ userId, productId, token, isInWishlist }, { rejectWithValue }) => {
    try {
      console.log(` [wishlistSlice] Toggle wishlist for product ${productId}`)

      const listId = await getOrCreateFavoriteList(userId, token)
      if (!listId) {
        throw new Error("No se pudo acceder a tu lista de favoritos")
      }

      console.log(`✅ [wishlistSlice] Using list ID: ${listId}`)
      console.log(
        `${isInWishlist ? "🗑️" : "➕"} [wishlistSlice] ${isInWishlist ? "Removing from" : "Adding to"} wishlist`,
      )

      const endpoint = isInWishlist
        ? `${API_URL}/api/favorite-list/${listId}/product-delete/${productId}`
        : `${API_URL}/api/favorite-list/${listId}/product-add`

      console.log(` [wishlistSlice] ${isInWishlist ? "DELETE" : "PUT"} ${endpoint}`)

      const options = {
        method: isInWishlist ? "DELETE" : "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }

      if (!isInWishlist) {
        const requestBody = {
          id: productId,
          productId: productId,
        }
        options.body = JSON.stringify(requestBody)
        console.log(` [wishlistSlice] Request body:`, requestBody)
      }

      const response = await fetch(endpoint, options)
      console.log(` [wishlistSlice] Response status: ${response.status}`)

      if (!response.ok) {
        let errorMsg = `Error ${response.status}`
        try {
          const errorData = await response.json()
          console.error(` [wishlistSlice] Error response (JSON):`, errorData)
          errorMsg = errorData.message || errorData.error || errorMsg
        } catch (e) {
          const errorText = await response.text()
          console.error(` [wishlistSlice] Error response (text):`, errorText)
          errorMsg = errorText || errorMsg
        }
        throw new Error(errorMsg)
      }

      console.log(" [wishlistSlice] Wishlist updated successfully!")

      return { productId, isInWishlist }
    } catch (error) {
      console.error(" [wishlistSlice] Error updating wishlist:", error)
      return rejectWithValue(error.message)
    }
  },
)

// Slice
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [], // Array de IDs de productos
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlistError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Toggle Wishlist
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false
        const { productId, isInWishlist } = action.payload

        if (isInWishlist) {
          // Remover
          state.items = state.items.filter((id) => id !== productId)
          console.log(`[wishlistSlice] Removed ${productId} from state`)
        } else {
          // Agregar
          if (!state.items.includes(productId)) {
            state.items.push(productId)
          }
          console.log(`[wishlistSlice] Added ${productId} to state`)
        }
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearWishlistError } = wishlistSlice.actions

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items
export const selectWishlistLoading = (state) => state.wishlist.loading
export const selectWishlistError = (state) => state.wishlist.error
export const selectIsInWishlist = (productId) => (state) => state.wishlist.items.includes(productId)

export default wishlistSlice.reducer
