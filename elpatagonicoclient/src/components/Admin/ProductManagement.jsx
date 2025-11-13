"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { fetchProducts, createProduct, updateProduct, toggleProductActive } from "../../redux/features/productSlice"
import { fetchCategories } from "../../redux/features/CategorySlice"
import { fetchDiscounts } from "../../redux/features/discountSlice"

const ProductManagement = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { list: products, loading } = useAppSelector((state) => state.products)
  const { list: categories } = useAppSelector((state) => state.categories)
  const { list: discounts } = useAppSelector((state) => state.discounts)

  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    stock: "",
    categoryId: "",
    discountId: "",
  })

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCategories())
    dispatch(fetchDiscounts())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formDataToSend = new FormData()

      const productData = {
        name: formData.name,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        stock: Number(formData.stock),
        categoryId: Number(formData.categoryId),
        ownerId: user?.id || JSON.parse(localStorage.getItem("user"))?.id,
      }

      if (formData.discountId) {
        productData.discountId = Number(formData.discountId)
      }

      formDataToSend.append(
        editingProduct ? "product" : "products",
        new Blob([JSON.stringify(productData)], { type: "application/json" }),
      )

      if (formData.images && formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          formDataToSend.append("images", formData.images[i])
        }
      }

      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, formDataToSend })).unwrap()
        alert("Producto actualizado exitosamente")
      } else {
        await dispatch(createProduct(formDataToSend)).unwrap()
        alert("Producto creado exitosamente")
      }

      dispatch(fetchProducts())
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error("Error saving product:", error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleToggleActive = async (product) => {
    const action = product.active ? "desactivar" : "activar"
    if (!confirm(`¿Estás seguro de ${action} este producto?`)) return

    try {
      await dispatch(toggleProductActive({ id: product.id, active: product.active })).unwrap()
      dispatch(fetchProducts())
      alert(`Producto ${action === "activar" ? "activado" : "desactivado"} exitosamente`)
    } catch (error) {
      console.error(`Error ${action} product:`, error)
      alert(`Error al ${action} el producto`)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      stock: product.stock,
      categoryId: product.categoryId || "",
      discountId: product.discount?.id || "",
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      basePrice: "",
      stock: "",
      categoryId: "",
      discountId: "",
    })
    setEditingProduct(null)
  }

  if (loading) return <div className="text-center p-4">Cargando productos...</div>

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
        Crear Producto
      </button>

      <div className="table-responsive">
        <table className="table table-striped bg-white">
          <thead style={{ backgroundColor: "#8B4513", color: "white" }}>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio Base</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Descuento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.description?.substring(0, 50)}...</td>
                <td>${product.basePrice}</td>
                <td>{product.stock}</td>
                <td>{product.categoryId}</td>
                <td>
                  {product.discount && product.discount !== "N/A" ? (
                    product.discount
                  ) : (
                    <span className="text-muted">Sin descuento</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${product.active ? "bg-success" : "bg-danger"}`}>
                    {product.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(product)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className={`btn btn-sm ${product.active ? "btn-warning" : "btn-success"}`}
                    onClick={() => handleToggleActive(product)}
                  >
                    <i className={`bi ${product.active ? "bi-toggle-off" : "bi-toggle-on"}`}></i>
                    {product.active ? " Desactivar" : " Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: "#8B4513", color: "white" }}>
                <h5 className="modal-title">{editingProduct ? "Editar Producto" : "Crear Producto"}</h5>
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
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Imágenes</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      onChange={(e) => setFormData({ ...formData, images: e.target.files })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Precio Base</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Categoría</label>
                      <select
                        className="form-select"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Descuento (opcional)</label>
                      <select
                        className="form-select"
                        value={formData.discountId}
                        onChange={(e) => setFormData({ ...formData, discountId: e.target.value })}
                      >
                        <option value="">Sin descuento</option>
                        {discounts.map((disc) => (
                          <option key={disc.id} value={disc.id}>
                            {disc.discountType} - {disc.amount}%
                          </option>
                        ))}
                      </select>
                    </div>
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
                      {editingProduct ? "Actualizar" : "Crear"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManagement
