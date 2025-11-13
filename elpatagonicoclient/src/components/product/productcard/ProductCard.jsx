"use client"

import { useState, useEffect } from "react"
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa"
import { Link } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "../../../redux/hooks"
import { addToCart } from "../../../redux/features/cartSlice"
import { toggleWishlist } from "../../../redux/features/wishlistSlice"
import "./ProductCard.css"

const ProductCard = ({ id, name, description, basePrice, price, imagesURL, active = true }) => {
  const dispatch = useAppDispatch()
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist)
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const [imageData, setImageData] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const API_URL = "http://localhost:8080"

  useEffect(() => {
    const fetchImageData = async () => {
      setImageLoading(true)
      setImageError(false)

      if (!imagesURL || imagesURL.length === 0) {
        setImageData(null)
        setImageLoading(false)
        return
      }

      const firstImageUrl = imagesURL[0]

      try {
        const fullUrl = firstImageUrl.startsWith("http") ? firstImageUrl : `${API_URL}${firstImageUrl}`

        const response = await fetch(fullUrl)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const imageJson = await response.json()

        if (imageJson.file) {
          const base64Data = imageJson.file
          const mimeType = "image/png"
          const dataUrl = `data:${mimeType};base64,${base64Data}`

          setImageData(dataUrl)
        } else {
          setImageData(null)
        }
      } catch (error) {
        console.error(`[ProductCard] Error fetching image for product ${id}:`, error)
        setImageError(true)
        setImageData(null)
      } finally {
        setImageLoading(false)
      }
    }

    fetchImageData()
  }, [imagesURL, id])

  const isInWishlist = wishlistItems.some((item) => item.id === id)

  const handleAddToCart = async () => {
    if (!active) return

    if (!isAuthenticated) {
      alert("⚠️ Debes iniciar sesión para agregar productos al carrito.")
      return
    }

    try {
      const productId = Number(id)
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap()
      alert(`${name} agregado al carrito ✅`)
    } catch (error) {
      console.error(`❌ Error al agregar el producto ${id} al carrito:`, error)
      alert("Ocurrió un error al agregar el producto al carrito.")
    }
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert("⚠️ Debes iniciar sesión para agregar a favoritos.")
      return
    }

    try {
      await dispatch(toggleWishlist(id)).unwrap()
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    }
  }

  const placeholderUrl = `https://placehold.co/400x300/e0f2f1/004d40?text=${encodeURIComponent(name || `Product ${id}`)}`
  const displayImage = imageData || placeholderUrl

  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = placeholderUrl
  }

  return (
    <div className={`product-card ${!active ? "out-of-stock" : ""}`}>
      <div className="product-card-image-container">
        <Link to={`/products/${id}`} className="product-card-link">
          {imageLoading ? (
            <div
              className="product-card-image"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0f0f0",
                minHeight: "300px",
              }}
            >
              <span>Cargando...</span>
            </div>
          ) : (
            <img
              src={displayImage || "/placeholder.svg"}
              alt={name}
              className="product-card-image"
              onError={handleImageError}
            />
          )}
        </Link>

        {!active && (
          <div className="product-out-of-stock-badge">
            <span>SIN STOCK</span>
          </div>
        )}

        {active && (
          <button
            className={`product-card-wishlist-btn ${isInWishlist ? "active" : ""}`}
            onClick={handleToggleWishlist}
            aria-label={isInWishlist ? "Eliminar de Favoritos" : "Añadir a Favoritos"}
          >
            {isInWishlist ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
      </div>

      <div className="product-card-content">
        <Link to={`/products/${id}`} className="product-card-title-link">
          <h3 className="product-card-title">{name}</h3>
        </Link>

        <p className="product-card-description">{description}</p>

        <div className="product-card-footer">
          {price && price < basePrice ? (
            <>
              <p className="product-card-base-price" style={{ textDecoration: "line-through", opacity: 0.6 }}>
                ${basePrice ? basePrice.toFixed(2) : "0.00"}
              </p>
              <p className="product-card-discount-price">${price.toFixed(2)}</p>
            </>
          ) : (
            <p className="product-card-base-price">${basePrice ? basePrice.toFixed(2) : "0.00"}</p>
          )}

          {active ? (
            <button className="product-card-cart-btn" onClick={handleAddToCart} title="Agregar al carrito">
              <FaShoppingCart />
            </button>
          ) : (
            <span className="product-out-of-stock-text">No disponible</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
