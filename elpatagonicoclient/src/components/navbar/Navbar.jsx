"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/logo.jpeg"
import { useSelector } from "react-redux"
import "./Navbar.css"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { items: cartItems } = useSelector((state) => state.cart)
  const navigate = useNavigate()

  // Calcular cantidades
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const isUserRole = user?.role === "USER"

  const handleNavigation = (path) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  const isAdmin = () => {
    if (!user || !user.role) return false

    let roleToCheck = ""
    if (Array.isArray(user.role)) {
      roleToCheck = user.role[0]?.authority || user.role[0]?.role || ""
    } else if (typeof user.role === "string") {
      roleToCheck = user.role
    }

    return String(roleToCheck).toUpperCase() === "ADMIN" || String(roleToCheck).toUpperCase() === "ROLE_ADMIN"
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light navbar-custom sticky-top">
      <div className="container">
        <button className="navbar-brand" onClick={() => handleNavigation("/")}>
          <img src={logo || "/placeholder.svg"} alt="Mates El Patagónico" className="navbar-logo" />
          <span className="navbar-title">Mates El Patagónico</span>
        </button>

        <button className="navbar-toggler" type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <button className="nav-link nav-link-custom btn btn-link" onClick={() => handleNavigation("/")}>
                <i className="bi bi-house-door me-1"></i> Inicio
              </button>
            </li>

            <li className="nav-item">
              <button className="nav-link nav-link-custom btn btn-link" onClick={() => handleNavigation("/favoritos")}>
                <i className="bi bi-heart me-1"></i> Favoritos
              </button>
            </li>

            <li className="nav-item">
              <button className="nav-link nav-link-custom btn btn-link" onClick={() => handleNavigation("/products")}>
                <i className="bi bi-grid me-1"></i> Productos
              </button>
            </li>

            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="#nosotros" onClick={() => setIsMenuOpen(false)}>
                <i className="bi bi-people me-1"></i> Nosotros
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="#contacto" onClick={() => setIsMenuOpen(false)}>
                <i className="bi bi-envelope me-1"></i> Contacto
              </a>
            </li>

            {isAuthenticated && isAdmin() && (
              <li className="nav-item">
                <button
                  className="nav-link nav-link-custom btn btn-link text fw-bold"
                  onClick={() => handleNavigation("/admin")}
                >
                  <i className="bi bi-gear-fill me-1"></i> Admin Panel
                </button>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isUserRole && (
              <button
                onClick={() => handleNavigation("/cart")}
                className="btn btn-link text-dark position-relative p-2"
                title="Ver carrito"
                style={{ textDecoration: "none" }}
              >
                <i className="bi bi-cart3 fs-5"></i>
                {cartCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <button onClick={() => handleNavigation("/profile")} className="btn btn-outline-dark">
                <i className="bi bi-person-circle me-2"></i> Mi Perfil
              </button>
            ) : (
              <button className="btn btn-primary-custom" onClick={() => handleNavigation("/login")}>
                <i className="bi bi-box-arrow-in-right me-2"></i> Ingresar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
