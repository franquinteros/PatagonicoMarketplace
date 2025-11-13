"use client"

import { useState, useEffect } from "react"

const PaymentMethodManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [formData, setFormData] = useState({ description: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
  try {
    const token = localStorage.getItem("token")

    const response = await fetch("http://localhost:8080/api/payment_methods", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    setPaymentMethods(data)
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    setPaymentMethods([])
  } finally {
    setLoading(false)
  }
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.description.trim()) {
      setError("La descripción es requerida")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const url = editingMethod
        ? `http://localhost:8080/api/payment_methods/${editingMethod.id}`
        : "http://localhost:8080/api/payment_methods"

      const response = await fetch(url, {
        method: editingMethod ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ description: "" })
        setShowForm(false)
        setEditingMethod(null)
        fetchPaymentMethods()
      } else {
        setError("Error al guardar el método de pago")
      }
    } catch (error) {
      setError("Error al guardar el método de pago")
    }
  }

  const handleEdit = (method) => {
    setEditingMethod(method)
    setFormData({ description: method.description })
    setShowForm(true)
  }

  const handleDelete = async (methodId) => {
    if (!window.confirm("¿Estás seguro de eliminar este método de pago?")) return

    try {
      const token = localStorage.getItem("token")
      await fetch(`http://localhost:8080/api/payment_methods/delete/${methodId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchPaymentMethods()
    } catch (error) {
      console.error("Error deleting payment method:", error)
    }
  }
  // </CHANGE>

  const handleCancel = () => {
    setShowForm(false)
    setEditingMethod(null)
    setFormData({ description: "" })
    setError("")
  }

  if (loading) return <div className="text-center p-4">Cargando...</div>

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: "#8B4513" }}>Gestión de Métodos de Pago</h2>
        <button
          className="btn"
          style={{ backgroundColor: "#8B4513", color: "white" }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancelar" : "Nuevo Método de Pago"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 p-4" style={{ backgroundColor: "#fffaf3" }}>
          <h4 style={{ color: "#8B4513" }}>{editingMethod ? "Editar Método de Pago" : "Nuevo Método de Pago"}</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <input
                type="text"
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ description: e.target.value })}
                placeholder="Ej: Tarjeta de Crédito, Efectivo, Transferencia"
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn" style={{ backgroundColor: "#8B4513", color: "white" }}>
                {editingMethod ? "Actualizar" : "Crear"}
              </button>
              {editingMethod && (
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
              {paymentMethods.map((method) => (
                <tr key={method.id}>
                  <td>{method.id}</td>
                  <td>{method.description}</td>
                  <td>
                    <button
                      className="btn btn-sm me-2"
                      style={{ backgroundColor: "#DAA520", color: "white" }}
                      onClick={() => handleEdit(method)}
                    >
                      Editar
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(method.id)}>
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

export default PaymentMethodManagement
