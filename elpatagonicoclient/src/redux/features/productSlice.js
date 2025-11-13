import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

// Obtener productos
export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
  console.log("[v0] productSlice - API_URL:", API_URL)
  console.log("[v0] productSlice - Fetching products from:", `${API_URL}/api/products`)

  const response = await fetch(`${API_URL}/api/products`)
  console.log("[v0] productSlice - Fetch response status:", response.status)

  const data = await response.json()
  console.log("[v0] productSlice - Products data:", data)

  return data.content || []
})

// Crear producto
export const createProduct = createAsyncThunk("products/createProduct", async (formDataToSend, { getState }) => {
  const token = localStorage.getItem("token")

  const response = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formDataToSend,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText)
  }

  return await response.json()
})

// Actualizar producto
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formDataToSend }, { getState }) => {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/api/products/put/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataToSend,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText)
    }

    return await response.json()
  },
)

// Activar/Desactivar producto
export const toggleProductActive = createAsyncThunk("products/toggleProductActive", async ({ id, active }) => {
  const token = localStorage.getItem("token")
  const url = active ? `${API_URL}/api/products/delete/${id}` : `${API_URL}/api/products/activate/${id}`
  const method = active ? "DELETE" : "PATCH"

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Error al ${active ? "desactivar" : "activar"} producto`)
  }

  return { id, active: !active }
})

const productSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Toggle active
      .addCase(toggleProductActive.fulfilled, (state, action) => {
        const product = state.list.find((p) => p.id === action.payload.id)
        if (product) {
          product.active = action.payload.active
        }
      })
  },
})

export default productSlice.reducer
