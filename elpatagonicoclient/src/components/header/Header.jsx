"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/logo.jpeg"
import { useSelector } from "react-redux"

const EXTERNAL_LINKS = {
  whatsapp: "https://wa.me/1234567890", // Reemplazar con tu número de WhatsApp
  instagram: "https://instagram.com/tu_cuenta", // Reemplazar con tu cuenta de Instagram
  catalogo: "/products", // URL del catálogo (puede ser externa o interna)
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { items: cartItems } = useSelector((state) => state.cart)
  const navigate = useNavigate()

  // Calcular la cantidad total de items en el carrito
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Verificar si el usuario es USER (no ADMIN)
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

  const handleWhatsAppClick = () => {
    window.open(EXTERNAL_LINKS.whatsapp, "_blank")
  }

  const handleInstagramClick = () => {
    window.open(EXTERNAL_LINKS.instagram, "_blank")
  }

  const handleCatalogoClick = () => {
    if (EXTERNAL_LINKS.catalogo.startsWith("http")) {
      window.open(EXTERNAL_LINKS.catalogo, "_blank")
    } else {
      window.location.href = EXTERNAL_LINKS.catalogo
    }
  }

  return (
    <header className="bg-white shadow-sm py-3">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo */}
        <div className="d-flex align-items-center">
          <img src={logo || "/placeholder.svg"} alt="Mates El Patagónico" height="60" className="rounded-circle" />
          <h1 className="ms-3 mb-0 fs-4 text-dark d-none d-md-block">Mates El Patagónico</h1>
        </div>

        {/* Botones de acción social */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-success d-flex align-items-center gap-2"
            onClick={handleWhatsAppClick}
            title="Contactar por WhatsApp"
          >
            <i className="bi bi-whatsapp"></i>
            <span className="d-none d-sm-inline">WhatsApp</span>
          </button>

          <button
            className="btn btn-danger d-flex align-items-center gap-2"
            onClick={handleInstagramClick}
            title="Seguinos en Instagram"
          >
            <i className="bi bi-instagram"></i>
            <span className="d-none d-sm-inline">Seguinos</span>
          </button>

          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleCatalogoClick}
            title="Ver catálogo completo"
          >
            <i className="bi bi-book"></i>
            <span className="d-none d-sm-inline">Catálogo</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
