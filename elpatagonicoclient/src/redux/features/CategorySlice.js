import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

// Obtener categorías
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    console.log("[v0] CategorySlice - Fetching categories from:", `${API_URL}/api/categories`)
    const response = await fetch(`${API_URL}/api/categories`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron obtener las categorías`)
    }
    
    const data = await response.json();
    console.log("[v0] CategorySlice - Raw categories data:", data)
    
    // La API de Spring Boot con Page retorna un objeto con la propiedad 'content'
    if (data && data.content && Array.isArray(data.content)) {
      console.log("[v0] CategorySlice - Returning content array with", data.content.length, "categories")
      return data.content
    } 
    // Si por alguna razón llega un array directo
    else if (Array.isArray(data)) {
      console.log("[v0] CategorySlice - Returning direct array with", data.length, "categories")
      return data
    } 
    // Fallback: retornar array vacío
    else {
      console.error("[v0] CategorySlice - Unexpected data structure!")
      return []
    }
  }
);

// Crear categoría
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (formData, { getState }) => {
    const token = getState().auth.token;

    await fetch(`${API_URL}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
  }
);

// Eliminar categoría
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { getState }) => {
    const token = getState().auth.token;

    await fetch(`${API_URL}/api/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    return id;
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;

export default categorySlice.reducer;