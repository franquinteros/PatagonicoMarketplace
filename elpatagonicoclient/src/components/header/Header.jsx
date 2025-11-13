"use client"

import { useState, useEffect } from "react"
import { useAppSelector } from "../../redux/hooks"
import { Link } from "react-router-dom"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items: cartItems } = useAppSelector((state) => state.cart)
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlistItems.length

  // ✅ DEBUG: Agregar logs para ver qué está pasando
  useEffect(() => {
    console.log("=== NAVBAR DEBUG ===")
    console.log("isAuthenticated:", isAuthenticated)
    console.log("user completo:", user)
    console.log("user.role:", user?.role)
    console.log("typeof user.role:", typeof user?.role)
    console.log("==================")
  }, [isAuthenticated, user])

  const closeMenu = () => setIsMenuOpen(false)

  // ✅ Verificación del rol admin simplificada sin logs
  const isAdmin = () => {
    if (!isAuthenticated || !user || !user.role) {
      return false
    }

    let roleToCheck = ""

    if (Array.isArray(user.role)) {
      roleToCheck = user.role[0]?.authority || user.role[0]?.role || ""
    } else if (typeof user.role === "string") {
      roleToCheck = user.role
    }

    const roleUpper = String(roleToCheck).toUpperCase()
    return roleUpper === "ADMIN" || roleUpper === "ROLE_ADMIN"
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-cart3"></i> MateMarket
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={closeMenu}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products" onClick={closeMenu}>
                Product Listing
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/checkout" onClick={closeMenu}>
                Checkout
              </Link>
            </li>

            {/* ✅ ADMIN PANEL */}
            {isAdmin() && (
              <li className="nav-item">
                <Link className="nav-link text-danger fw-bold" to="/admin" onClick={closeMenu}>
                  <i className="bi bi-gear-fill me-1"></i>
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            <Link to="/wishlist" className="text-dark me-3 position-relative" onClick={closeMenu}>
              <i className="bi bi-heart fs-5"></i>
              {wishlistCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.6em" }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="text-dark me-3 position-relative" onClick={closeMenu}>
              <i className="bi bi-cart fs-5"></i>
              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.6em" }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link to="/profile" className="text-dark" onClick={closeMenu} title="Mi Perfil">
                <i className="bi bi-person-circle fs-5"></i>
              </Link>
            ) : (
              <Link to="/login" className="text-dark" onClick={closeMenu} title="Ingresar">
                <i className="bi bi-person fs-5"></i>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
