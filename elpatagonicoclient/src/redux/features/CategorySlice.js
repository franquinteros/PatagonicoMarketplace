import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Obtener categorías
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const response = await fetch("http://localhost:8080/api/categories");
    const data = await response.json();
    return data.content || data;
  }
);

// Crear categoría
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (formData, { getState }) => {
    const token = getState().auth.token;

    await fetch("http://localhost:8080/api/categories", {
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

    await fetch(`http://localhost:8080/api/categories/${id}`, {
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
    loading: true,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export default categorySlice.reducer;
