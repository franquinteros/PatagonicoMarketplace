import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

// Obtener productos
export const fetchProducts = createAsyncThunk("products/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    console.log("[v0] productSlice - API_URL:", API_URL)
    console.log("[v0] productSlice - Fetching products from:", `${API_URL}/api/products`)

    const response = await fetch(`${API_URL}/api/products`)
    console.log("[v0] productSlice - Fetch response status:", response.status)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron obtener los productos`)
    }

    const data = await response.json()
    console.log("[v0] productSlice - Raw products data:", data)
    console.log("[v0] productSlice - Data type:", typeof data)
    console.log("[v0] productSlice - Is Array?:", Array.isArray(data))
    console.log("[v0] productSlice - Has content property?:", data?.content !== undefined)

    // La API de Spring Boot con Page retorna un objeto con la propiedad 'content'
    if (data && data.content && Array.isArray(data.content)) {
      console.log("[v0] productSlice - Returning content array with", data.content.length, "products")
      return data.content
    } 
    // Si por alguna razon llega un array directo
    else if (Array.isArray(data)) {
      console.log("[v0] productSlice - Returning direct array with", data.length, "products")
      return data
    } 
    // Fallback: retornar array vacio
    else {
      console.error("[v0] productSlice - Unexpected data structure!")
      console.error("[v0] productSlice - Data keys:", Object.keys(data || {}))
      console.error("[v0] productSlice - Full data:", JSON.stringify(data, null, 2))
      return []
    }
  } catch (error) {
    console.error("[v0] productSlice - Error fetching products:", error)
    return rejectWithValue(error.message)
  }
})

// Crear producto
export const createProduct = createAsyncThunk(
  "products/createProduct", 
  async (formDataToSend, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token de autenticacion")
      }

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al crear producto")
      }

      const data = await response.json()
      console.log("[v0] productSlice - Product created:", data)
      return data
    } catch (error) {
      console.error("[v0] productSlice - Error creating product:", error)
      return rejectWithValue(error.message)
    }
  }
)

// Actualizar producto
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formDataToSend }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token de autenticacion")
      }

      const response = await fetch(`${API_URL}/api/products/put/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al actualizar producto")
      }

      const data = await response.json()
      console.log("[v0] productSlice - Product updated:", data)
      return data
    } catch (error) {
      console.error("[v0] productSlice - Error updating product:", error)
      return rejectWithValue(error.message)
    }
  }
)

// Activar/Desactivar producto
export const toggleProductActive = createAsyncThunk(
  "products/toggleProductActive", 
  async ({ id, active }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token de autenticacion")
      }

      const url = active 
        ? `${API_URL}/api/products/delete/${id}` 
        : `${API_URL}/api/products/activate/${id}`
      const method = active ? "DELETE" : "PATCH"

      console.log(`[v0] productSlice - ${method} ${url}`)

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error al ${active ? "desactivar" : "activar"} producto`)
      }

      console.log(`[v0] productSlice - Product ${active ? "deactivated" : "activated"}:`, id)
      return { id, active: !active }
    } catch (error) {
      console.error("[v0] productSlice - Error toggling product:", error)
      return rejectWithValue(error.message)
    }
  }
)

const productSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProductError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        console.log("[v0] productSlice - Fetch pending...")
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        console.log("[v0] productSlice - Fetch fulfilled with", action.payload.length, "products")
        state.loading = false
        state.list = action.payload
        state.error = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        console.error("[v0] productSlice - Fetch rejected:", action.payload)
        state.loading = false
        state.error = action.payload || "Error al cargar productos"
        state.list = []
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false
        state.list.push(action.payload)
        state.error = null
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Error al crear producto"
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false
        const index = state.list.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) {
          state.list[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Error al actualizar producto"
      })
      // Toggle active
      .addCase(toggleProductActive.fulfilled, (state, action) => {
        const product = state.list.find((p) => p.id === action.payload.id)
        if (product) {
          product.active = action.payload.active
        }
      })
      .addCase(toggleProductActive.rejected, (state, action) => {
        state.error = action.payload || "Error al cambiar estado del producto"
      })
  },
})

export const { clearProductError } = productSlice.actions

// Selectors
export const selectProducts = (state) => state.products.list
export const selectProductsLoading = (state) => state.products.loading
export const selectProductsError = (state) => state.products.error

export default productSlice.reducer