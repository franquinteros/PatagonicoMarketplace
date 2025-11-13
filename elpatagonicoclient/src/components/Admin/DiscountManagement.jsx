"use client"

import { useState, useEffect } from "react"

const API_URL = "http://localhost:8080"

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [selectedDiscount, setSelectedDiscount] = useState(null)
  const [assignType, setAssignType] = useState("products")
  const [selectedItems, setSelectedItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    discountType: "",
  })

  useEffect(() => {
    fetchDiscounts()
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchDiscounts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/discounts`)
      const data = await response.json()
      setDiscounts(data)
    } catch (error) {
      console.error("Error fetching discounts:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`)
      const data = await response.json()
      setProducts(data.content || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`)
      const data = await response.json()
      setCategories(data.content || data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")

    try {
      const url = editingDiscount ? `${API_URL}/api/discounts/update/${editingDiscount.id}` : `${API_URL}/api/discounts`

      const method = editingDiscount ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number.parseInt(formData.amount),
          discountType: formData.discountType,
        }),
      })

      if (response.ok) {
        fetchDiscounts()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving discount:", error)
    }
  }

  const handleDelete = async (discountId) => {
    if (!confirm("¿Estás seguro de eliminar este descuento?")) return

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`${API_URL}/api/discounts/${discountId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchDiscounts()
      }
    } catch (error) {
      console.error("Error deleting discount:", error)
    }
  }

  const handleAssign = async () => {
    if (selectedItems.length === 0) {
      alert("Por favor selecciona al menos un elemento")
      return
    }

    setLoading(true)
    const token = localStorage.getItem("token")

    console.log("=== ASIGNANDO DESCUENTO ===")
    console.log("📦 Descuento seleccionado:", selectedDiscount)
    console.log("📋 Tipo:", assignType)
    console.log("🎯 Items seleccionados:", selectedItems)
    console.log("🔑 Token presente:", !!token)

    try {
      if (assignType === "products") {
        const productIds = selectedItems.map((id) => Number.parseInt(id))
        const url = `${API_URL}/api/discounts/${selectedDiscount.id}/products`
        
        console.log("📡 [Discount] PUT", url)
        console.log("📤 [Discount] Body:", productIds)

        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productIds),
        })

        console.log("📥 [Discount] Response status:", response.status)
        
        if (response.ok) {
          const responseData = await response.text()
          console.log("✅ [Discount] Response data:", responseData)
          
          alert(`Descuento asignado exitosamente a ${selectedItems.length} producto(s)`)
          setShowAssignModal(false)
          setSelectedItems([])
          fetchProducts()
        } else {
          const errorText = await response.text()
          console.error("❌ [Discount] Error response:", errorText)
          alert(`Error al asignar descuento: ${errorText}`)
        }
      } else {
        // Asignar a categorías
        console.log("📡 [Discount] Asignando a categorías...")
        
        for (const categoryId of selectedItems) {
          const url = `${API_URL}/api/discounts/${selectedDiscount.id}/category/${categoryId}`
          console.log("📡 [Discount] PUT", url)
          
          const response = await fetch(url, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          
          console.log("📥 [Discount] Response status:", response.status)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error("❌ [Discount] Error en categoría", categoryId, ":", errorText)
          }
        }
        
        alert(
          `Descuento asignado exitosamente a ${selectedItems.length} categoría(s). Todos los productos de estas categorías han sido actualizados con el descuento.`,
        )
        setShowAssignModal(false)
        setSelectedItems([])
        fetchProducts()
      }
    } catch (error) {
      console.error("❌ [Discount] Error al asignar:", error)
      alert("Error al asignar el descuento. Por favor intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (discount) => {
    setEditingDiscount(discount)
    setFormData({
      amount: discount.amount,
      discountType: discount.discountType,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      amount: "",
      discountType: "",
    })
    setEditingDiscount(null)
  }

  const toggleItemSelection = (itemId) => {
    console.log("🔄 Toggle item:", itemId)
    setSelectedItems((prev) => {
      const newSelection = prev.includes(itemId) 
        ? prev.filter((id) => id !== itemId) 
        : [...prev, itemId]
      console.log("📋 Nueva selección:", newSelection)
      return newSelection
    })
  }

  return (
    <div>
      <button
        className="btn mb-4"
        style={{ backgroundColor: "#8B4513", color: "white" }}
        onClick={() => {
          resetForm()
          setShowModal(true)
        }}
      >
        <i className="bi bi-plus-circle me-2"></i>
        Crear Descuento
      </button>

      <div className="table-responsive">
        <table className="table table-striped bg-white">
          <thead style={{ backgroundColor: "#8B4513", color: "white" }}>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Porcentaje</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => (
              <tr key={discount.id}>
                <td>{discount.id}</td>
                <td>{discount.discountType}</td>
                <td>{discount.amount}%</td>
                <td>
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => {
                      console.log("🎯 Abriendo modal para descuento:", discount)
                      setSelectedDiscount(discount)
                      setSelectedItems([])
                      setShowAssignModal(true)
                    }}
                  >
                    <i className="bi bi-link"></i> Asignar
                  </button>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(discount)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(discount.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: "#8B4513", color: "white" }}>
                <h5 className="modal-title">{editingDiscount ? "Editar Descuento" : "Crear Descuento"}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Tipo de Descuento</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      placeholder="Ej: Descuento de Verano"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Porcentaje (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-control"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn" style={{ backgroundColor: "#8B4513", color: "white" }}>
                      {editingDiscount ? "Actualizar" : "Crear"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedDiscount && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: "#8B4513", color: "white" }}>
                <h5 className="modal-title">
                  Asignar Descuento: {selectedDiscount.discountType} ({selectedDiscount.amount}%)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedItems([])
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Asignar a:</label>
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${assignType === "products" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => {
                        setAssignType("products")
                        setSelectedItems([])
                      }}
                    >
                      Productos
                    </button>
                    <button
                      type="button"
                      className={`btn ${assignType === "categories" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => {
                        setAssignType("categories")
                        setSelectedItems([])
                      }}
                    >
                      Categorías
                    </button>
                  </div>
                </div>

                <div className="alert alert-info">
                  <small>
                    {selectedItems.length === 0 
                      ? "Selecciona al menos un elemento para continuar" 
                      : `${selectedItems.length} elemento(s) seleccionado(s)`}
                  </small>
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {assignType === "products" ? (
                    <div className="list-group">
                      {products.length === 0 ? (
                        <div className="alert alert-warning">No hay productos disponibles</div>
                      ) : (
                        products.map((product) => (
                          <label key={product.id} className="list-group-item d-flex align-items-center">
                            <input
                              type="checkbox"
                              className="form-check-input me-3"
                              checked={selectedItems.includes(product.id.toString())}
                              onChange={() => toggleItemSelection(product.id.toString())}
                            />
                            <div>
                              <strong>{product.name}</strong>
                              <br />
                              <small className="text-muted">${product.basePrice}</small>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="list-group">
                      {categories.length === 0 ? (
                        <div className="alert alert-warning">No hay categorías disponibles</div>
                      ) : (
                        categories.map((category) => (
                          <label key={category.id} className="list-group-item d-flex align-items-center">
                            <input
                              type="checkbox"
                              className="form-check-input me-3"
                              checked={selectedItems.includes(category.id.toString())}
                              onChange={() => toggleItemSelection(category.id.toString())}
                            />
                            <strong>{category.description}</strong>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAssignModal(false)
                      setSelectedItems([])
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ backgroundColor: "#8B4513", color: "white" }}
                    onClick={handleAssign}
                    disabled={selectedItems.length === 0 || loading}
                  >
                    {loading ? "Asignando..." : `Asignar (${selectedItems.length})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiscountManagement