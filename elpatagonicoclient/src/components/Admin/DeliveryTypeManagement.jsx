"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import {
  fetchDeliveryTypes,
  createDeliveryType,
  updateDeliveryType,
  deleteDeliveryType,
} from "../../redux/features/deliveryTypeSlice"

const DeliveryTypeManagement = () => {
  const dispatch = useAppDispatch()
  const { list: deliveryTypes, loading } = useAppSelector((state) => state.deliveryTypes)

  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [formData, setFormData] = useState({ description: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    dispatch(fetchDeliveryTypes())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.description.trim()) {
      setError("La descripción es requerida")
      return
    }

    try {
      if (editingType) {
        await dispatch(updateDeliveryType({ id: editingType.id, formData })).unwrap()
      } else {
        await dispatch(createDeliveryType(formData)).unwrap()
      }

      setFormData({ description: "" })
      setShowForm(false)
      setEditingType(null)
      dispatch(fetchDeliveryTypes())
    } catch (error) {
      setError("Error al guardar el tipo de envío")
    }
  }

  const handleEdit = (type) => {
    setEditingType(type)
    setFormData({ description: type.description })
    setShowForm(true)
  }

  const handleDelete = async (typeId) => {
    if (!window.confirm("¿Estás seguro de eliminar este tipo de envío?")) return

    try {
      await dispatch(deleteDeliveryType(typeId)).unwrap()
    } catch (error) {
      console.error("Error deleting delivery type:", error)
      alert("Error al eliminar tipo de envío")
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingType(null)
    setFormData({ description: "" })
    setError("")
  }

  if (loading) return <div className="text-center p-4">Cargando...</div>

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: "#8B4513" }}>Gestión de Tipos de Envío</h2>
        <button
          className="btn"
          style={{ backgroundColor: "#8B4513", color: "white" }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancelar" : "Nuevo Tipo de Envío"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 p-4" style={{ backgroundColor: "#fffaf3" }}>
          <h4 style={{ color: "#8B4513" }}>{editingType ? "Editar Tipo de Envío" : "Nuevo Tipo de Envío"}</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <input
                type="text"
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ description: e.target.value })}
                placeholder="Ej: Envío a domicilio, Retiro en sucursal"
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn" style={{ backgroundColor: "#8B4513", color: "white" }}>
                {editingType ? "Actualizar" : "Crear"}
              </button>
              {editingType && (
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
              )}
            </div>
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
              {deliveryTypes.map((type) => (
                <tr key={type.id}>
                  <td>{type.id}</td>
                  <td>{type.description}</td>
                  <td>
                    <button
                      className="btn btn-sm me-2"
                      style={{ backgroundColor: "#DAA520", color: "white" }}
                      onClick={() => handleEdit(type)}
                    >
                      Editar
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(type.id)}>
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

export default DeliveryTypeManagement
