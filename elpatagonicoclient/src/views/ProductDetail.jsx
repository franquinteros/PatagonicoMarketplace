"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { addToCart } from "../redux/features/cartSlice"
import { toggleWishlist } from "../redux/features/wishlistSlice"

const API_URL = "http://localhost:8080"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, token } = useSelector((state) => state.auth)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  // Estados para las imágenes
  const [images, setImages] = useState([])
  const [imagesLoading, setImagesLoading] = useState(false)

  // Fetch del producto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/search/id/${id}`)
        console.log("[ProductDetail] Fetching product from:", `${API_URL}/api/products/search/id/${id}`)

        if (!response.ok) {
          throw new Error("Producto no encontrado")
        }
        const data = await response.json()
        console.log("[ProductDetail] Product data received:", data)
        setProduct(data)
      } catch (err) {
        console.error("[ProductDetail] Error fetching product:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // Fetch de las imágenes cuando el producto está cargado
  useEffect(() => {
    const fetchImages = async () => {
      if (!product || !product.imagesURL || product.imagesURL.length === 0) {
        console.log("[ProductDetail] No images to fetch for this product")
        setImages([])
        return
      }

      setImagesLoading(true)
      const fetchedImages = []

      try {
        // Iterar sobre cada URL de imagen
        for (const imageUrl of product.imagesURL) {
          console.log(`[ProductDetail] Fetching image: ${imageUrl}`)

          try {
            const fullUrl = imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`

            const response = await fetch(fullUrl)

            if (!response.ok) {
              console.error(`[ProductDetail] Failed to fetch image: ${imageUrl}`)
              continue
            }

            const imageJson = await response.json()

            if (imageJson.file) {
              const mimeType = "image/png"
              const dataUrl = `data:${mimeType};base64,${imageJson.file}`
              fetchedImages.push(dataUrl)
              console.log(`[ProductDetail] Image loaded successfully`)
            }
          } catch (imgError) {
            console.error(`[ProductDetail] Error fetching individual image:`, imgError)
          }
        }

        console.log(`[ProductDetail] Total images loaded: ${fetchedImages.length}`)
        setImages(fetchedImages)
      } catch (error) {
        console.error("[ProductDetail] Error in fetchImages:", error)
      } finally {
        setImagesLoading(false)
      }
    }

    fetchImages()
  }, [product])

  const handleAddToCart = async () => {
    if (product) {
      try {
        await dispatch(
          addToCart({
            productId: product.id,
            quantity,
            userId: user?.id,
            token,
          }),
        ).unwrap()
        alert(`${product.name} agregado al carrito`)
      } catch (error) {
        console.error("Error al agregar al carrito:", error)
        alert("Usuario no autenticado. Iniciar sesión")
      }
    }
  }

  const handleToggleWishlist = async () => {
    if (!user || !token) {
      alert("Debes iniciar sesión para agregar a favoritos")
      return
    }

    try {
      await dispatch(
        toggleWishlist({
          productId: product.id,
          userId: user.id,
          token,
        }),
      ).unwrap()
    } catch (error) {
      console.error("Error al cambiar favoritos:", error)
      alert("Error al actualizar favoritos")
    }
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 99)) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error || "No se pudo cargar el producto"}</p>
          <hr />
          <button className="btn btn-primary" onClick={() => navigate("/products")}>
            Volver a Productos
          </button>
        </div>
      </div>
    )
  }

  const isInWishlist = wishlistItems.some((item) => item.id === product.id)
  const placeholderUrl = `https://placehold.co/500x500/e0f2f1/004d40?text=${encodeURIComponent(product.name || "Producto")}`
  const displayImages = images.length > 0 ? images : [placeholderUrl]

  return (
    <div className="container my-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate("/")}>
              Inicio
            </button>
          </li>
          <li className="breadcrumb-item">
            <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate("/products")}>
              Productos
            </button>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row">
        {/* Product Images */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="position-relative" style={{ height: "500px" }}>
                {imagesLoading ? (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando imagen...</span>
                    </div>
                  </div>
                ) : (
                  <img
                    src={displayImages[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-100 h-100 object-fit-cover rounded"
                    style={{ objectFit: "contain" }}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = placeholderUrl
                    }}
                  />
                )}
                <button
                  className={`position-absolute top-0 end-0 m-3 btn ${
                    isInWishlist ? "btn-danger" : "btn-outline-danger"
                  } rounded-circle`}
                  style={{ width: "50px", height: "50px" }}
                  onClick={handleToggleWishlist}
                >
                  <i className={`bi ${isInWishlist ? "bi-heart-fill" : "bi-heart"}`}></i>
                </button>
              </div>

              {displayImages.length > 1 && (
                <div className="d-flex gap-2 p-3 overflow-auto">
                  {displayImages.map((img, index) => (
                    <button
                      key={index}
                      className={`btn p-0 border ${selectedImage === index ? "border-primary border-3" : ""}`}
                      style={{ width: "80px", height: "80px" }}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = placeholderUrl
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="h2 mb-3">{product.name}</h1>

              {product.category && (
                <div className="mb-3">
                  <span className="badge bg-secondary">{product.category.name}</span>
                </div>
              )}

              <div className="mb-4">
                <h2 className="h3 text-success mb-0">${product.price?.toFixed(2)}</h2>
                {product.stock && (
                  <small className="text-muted">
                    {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
                  </small>
                )}
              </div>

              <hr />

              <div className="mb-4">
                <h5>Descripción</h5>
                <p className="text-muted">{product.description || "Sin descripción disponible"}</p>
              </div>

              {product.stock > 0 && (
                <>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Cantidad</label>
                    <div className="input-group" style={{ maxWidth: "150px" }}>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <input
                        type="text"
                        className="form-control text-center"
                        value={quantity}
                        readOnly
                        style={{ maxWidth: "60px" }}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= (product.stock || 99)}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                      <i className="bi bi-cart-plus me-2"></i>
                      Agregar al Carrito
                    </button>
                    <button className="btn btn-outline-primary" onClick={() => navigate("/cart")}>
                      <i className="bi bi-cart me-2"></i>
                      Ver Carrito
                    </button>
                  </div>
                </>
              )}

              {product.stock === 0 && (
                <div className="alert alert-warning" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Producto sin stock
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="card shadow-sm mt-3">
            <div className="card-body">
              <h5 className="card-title">Información Adicional</h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="bi bi-truck me-2 text-primary"></i>
                  Envío a todo el país
                </li>
                <li className="mb-2">
                  <i className="bi bi-shield-check me-2 text-success"></i>
                  Compra protegida
                </li>
                <li className="mb-2">
                  <i className="bi bi-arrow-return-left me-2 text-info"></i>
                  Devolución gratis
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
