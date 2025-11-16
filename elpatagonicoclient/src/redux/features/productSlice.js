import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios";
import { act } from "react";


const API_URL = "http://localhost:8080"


// ===================== THUNKS =====================

// Obtener productos
export const fetchProducts = createAsyncThunk("products/fetchProducts", async (_, {rejectWithValue}) => {
  try {
    const {data} = await axios(`${API_URL}/api/products`)
    return data

  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Crear producto
export const createProduct = createAsyncThunk("products/createProduct", async (formDataToSend, { rejectWithValue, getState }) => {

  try{
    //obtenemos el token del estado global auth
    const token = getState().auth.token

    const {data} = await axios.post(`${API_URL}/api/products`, formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data', //POSIBLE LÍNEA A SACAR SI ALGO FALLA
        Authorization: `Bearer ${token}`
      }
    })
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Actualizar producto
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formDataToSend }, { rejectWithValue, getState }) => {
    try {

      const token = getState().auth.token

      const { data } = await axios.put(`${API_URL}/api/products/put/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      return data

    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Activar/Desactivar producto
export const toggleProductActive = createAsyncThunk("products/toggleProductActive", async ({ id, active }, { rejectWithValue, getState }) => {
  try {

    //obtenemos el token del estado global auth
    const token = getState().auth.token

    if (active){
      await axios.delete(`${API_URL}/api/products/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
      }
    })
      return {id, active: !active}
    }
    if (!active){ //patch lleva un body, pero en este caso es vacío.
      await axios.patch(`${API_URL}/api/products/activate/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
      }
    })
      return {id, active: !active}
    }
    // const url = active ? `/api/products/delete/${id}` : `/api/products/activate/${id}`
    // const method = active ? "delete" : "patch"

    // await axiosInstance[method](url)

    //return { id, active: !active }
  } catch (error) {
    return rejectWithValue(error.message)
  }
})


// ===================== SLICE =====================

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
        state.list = action.payload.content
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Toggle active
      .addCase(toggleProductActive.fulfilled, (state, action) => {
        const product = state.list.find((p) => p.id === action.payload.id)
        if (product) {
          product.active = action.payload.active
        }
      })
      .addCase(toggleProductActive.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(createProduct.pending, (state) => {
        state.loading= true;
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action)=>{
        state.loading = false,
        state.error = null,
        state.list = [...state.list, action.payload]
      })
      .addCase(createProduct.rejected, (state, action) =>{
        state.loading = false,
        state.error = action.payload
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false
        state.error = null

        const index = state.list.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.list[index] = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

  
  },
})

export default productSlice.reducer
