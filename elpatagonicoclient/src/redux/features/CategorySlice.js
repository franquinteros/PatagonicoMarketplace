import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_URL = "http://localhost:8080"

// ===================== THUNKS =====================
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/categories`)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (formData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token

      const { data } = await axios.post(
        `${API_URL}/api/categories`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token
      const products = getState().products.list

      // verificamos que la categoría tenga productos
      const productsInCategory = products.filter((p) => p.categoryId === id)

      // desactivación lógica de los productos que pertenezcan a la categoría
      if (productsInCategory.length > 0) {
        const allProductsToToggle = productsInCategory.filter((p) => p.isActive === true)

        // despachamos la acción de desactivar los productos al store
        const togglePromises = allProductsToToggle.map((product) =>
          dispatch(
            toggleProductActive({
              id: product.id,
              active: true, // ajustar según la semántica de tu thunk
            })
          )
        )

        // asegurarnos que para todos los productos, las promesas hayan sido FULFILLED
        await Promise.all(togglePromises)

        return null // salir, pero que el reducer no lo quite de la lista
      } else {
        await axios.delete(`${API_URL}/api/categories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return id // quitarlo de la lista
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// ===================== SLICE =====================
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.content
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.list.push(action.payload)
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        // action.payload puede ser null (no eliminar) o id (eliminar)
        if (action.payload) {
          state.list = state.list.filter((c) => c.id !== action.payload)
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearError } = categorySlice.actions
export default categorySlice.reducer
