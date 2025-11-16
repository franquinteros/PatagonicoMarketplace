"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import ProductManagement from "../components/Admin/ProductManagement"
import DiscountManagement from "../components/Admin/DiscountManagement"
import CategoryManagement from "../components/Admin/CategoryManagement"
import PaymentMethodManagement from "../components/Admin/PaymentMethodManagement"
import DeliveryTypeManagement from "../components/Admin/DeliveryTypeManagement"

const AdminDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("products")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      navigate("/")
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="container-fluid" style={{ backgroundColor: "#f9f5f0", minHeight: "100vh" }}>
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 bg-dark text-white p-0">
          <div className="p-4">
            <h4 className="mb-4">Panel Admin</h4>
            <p className="small mb-4">Bienvenido, {user?.name}</p>
            <nav className="nav flex-column">
              <button
                className={`nav-link text-white text-start btn ${activeTab === "products" ? "bg-secondary" : ""}`}
                onClick={() => setActiveTab("products")}
              >
                <i className="bi bi-box-seam me-2"></i>
                Productos
              </button>
              <button
                className={`nav-link text-white text-start btn ${activeTab === "discounts" ? "bg-secondary" : ""}`}
                onClick={() => setActiveTab("discounts")}
              >
                <i className="bi bi-percent me-2"></i>
                Descuentos
              </button>
              <button
                className={`nav-link text-white text-start btn ${activeTab === "categories" ? "bg-secondary" : ""}`}
                onClick={() => setActiveTab("categories")}
              >
                <i className="bi bi-tags me-2"></i>
                Categorías
              </button>
              <button
                className={`nav-link text-white text-start btn ${activeTab === "payments" ? "bg-secondary" : ""}`}
                onClick={() => setActiveTab("payments")}
              >
                <i className="bi bi-credit-card me-2"></i>
                Métodos de Pago
              </button>
              <button
                className={`nav-link text-white text-start btn ${activeTab === "delivery" ? "bg-secondary" : ""}`}
                onClick={() => setActiveTab("delivery")}
              >
                <i className="bi bi-truck me-2"></i>
                Tipos de Envío
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold" style={{ color: "#8B4513" }}>
              {activeTab === "products" && "Gestión de Productos"}
              {activeTab === "discounts" && "Gestión de Descuentos"}
              {activeTab === "categories" && "Gestión de Categorías"}
              {activeTab === "payments" && "Gestión de Métodos de Pago"}
              {activeTab === "delivery" && "Gestión de Tipos de Envío"}
            </h2>
            <button className="btn btn-outline-dark" onClick={() => navigate("/")}>
              Ver Tienda
            </button>
          </div>

          {activeTab === "products" && <ProductManagement />}
          {activeTab === "discounts" && <DiscountManagement />}
          {activeTab === "categories" && <CategoryManagement />}
          {activeTab === "payments" && <PaymentMethodManagement />}
          {activeTab === "delivery" && <DeliveryTypeManagement />}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
