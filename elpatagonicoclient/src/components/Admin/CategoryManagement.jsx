"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchCategories, createCategory, deleteCategory } from "../../redux/features/categorySlice";

const CategoryManagement = () => {
  const dispatch = useDispatch()
  const { list: categories, loading } = useSelector((state) => state.categories)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ description: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.description.trim()) return setError("La descripción es requerida")
    await dispatch(createCategory(formData))
    setFormData({ description: "" })
    setShowForm(false)
    dispatch(fetchCategories())
  }

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro?")) {
      dispatch(deleteCategory(id))
    }
  }

  if (loading) return <div className="text-center p-4">Cargando...</div>

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: "#8B4513" }}>Gestión de Categorías</h2>
        <button
          className="btn"
          style={{ backgroundColor: "#8B4513", color: "white" }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancelar" : "Nueva Categoría"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 p-4" style={{ backgroundColor: "#fffaf3" }}>
          <h4 style={{ color: "#8B4513" }}>Nueva Categoría</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <input
                type="text"
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ description: e.target.value })}
                placeholder="Ej: Mates, Bombillas, Termos"
              />
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: "#8B4513", color: "white" }}>
              Crear Categoría
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ backgroundColor: "#fffaf3" }}>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.description}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(category.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CategoryManagement
