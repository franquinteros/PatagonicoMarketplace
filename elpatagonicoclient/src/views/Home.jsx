"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchCategories } from "../redux/features/categorySlice"
import { fetchProducts } from "../redux/features/productSlice"
import mates from "../assets/mates.png"

const EXTERNAL_LINKS = {
  whatsapp: "https://wa.me/1234567890",
  instagram: "https://instagram.com/tu_cuenta",
  catalogo: "/products",
}

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { list: categories, loading: categoriesLoading, error: categoriesError } = useSelector((state) => state.categories)
  const { list: products, loading: productsLoading, error: productsError } = useSelector((state) => state.products)

  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(false)

  const API_URL = "http://localhost:8080"

  useEffect(() => {
    console.log("[v1] Home - Dispatching fetchCategories and fetchProducts")
    dispatch(fetchCategories())
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    console.log("[v1] Home - Categories state:", { 
      categories, 
      categoriesLoading, 
      categoriesError,
      categoriesLength: categories?.length 
    })
    console.log("[v1] Home - Products state:", { 
      products, 
      productsLoading, 
      productsError,
      productsLength: products?.length 
    })
  }, [categories, categoriesLoading, categoriesError, products, productsLoading, productsError])

  // Estrategia 1: Usar productos directamente del Redux store
  useEffect(() => {
    if (products && products.length > 0) {
      console.log("[v1] Home - Using products from Redux store")
      // Tomar los primeros 4 productos como destacados
      const featured = products.slice(0, 4)
      console.log("[v1] Home - Featured products from Redux:", featured)
      setFeaturedProducts(featured)
      setLoadingFeatured(false)
    }
  }, [products])

  // Estrategia 2: Si no hay productos en Redux, intentar cargar algunos manualmente
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      // Si ya tenemos productos de Redux, no hacer nada
      if (products && products.length > 0) {
        return
      }

      // Si no hay productos después de un tiempo, intentar cargar algunos
      setLoadingFeatured(true)
      try {
        console.log("[v1] Home - No products in Redux, fetching directly...")
        
        // Intentar obtener productos directamente
        const response = await fetch(`${API_URL}/api/products`)
        if (response.ok) {
          const data = await response.json()
          const productsArray = data.content || data
          
          if (Array.isArray(productsArray) && productsArray.length > 0) {
            const featured = productsArray.slice(0, 4)
            console.log("[v1] Home - Featured products from direct fetch:", featured)
            setFeaturedProducts(featured)
          }
        }
      } catch (error) {
        console.error("[v1] Home - Error loading featured products:", error)
      } finally {
        setLoadingFeatured(false)
      }
    }

    const timer = setTimeout(() => {
      if (productsLoading && categoriesLoading) {
        loadFeaturedProducts()
      }
    }, 2000) // Esperar 2 segundos antes de intentar carga directa

    return () => clearTimeout(timer)
  }, [products, productsLoading, categoriesLoading, API_URL])

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
      navigate(EXTERNAL_LINKS.catalogo)
    }
  }

  const features = [
    {
      icon: "bi-truck",
      title: "Envío Gratis",
      description: "En compras superiores a $30.000",
    },
    {
      icon: "bi-shield-check",
      title: "Calidad Garantizada",
      description: "Productos artesanales de primera calidad",
    },
    {
      icon: "bi-credit-card",
      title: "Pago Seguro",
      description: "Múltiples métodos de pago disponibles",
    },
  ]

  const isLoading = categoriesLoading || productsLoading || loadingFeatured
  const hasError = categoriesError || productsError
  const hasProducts = featuredProducts.length > 0

  console.log("[v1] Home - Render state:", {
    isLoading,
    hasError,
    hasProducts,
    featuredProductsCount: featuredProducts.length,
    categoriesCount: categories?.length
  })

  return (
    <div>
      <section id="home" className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0 animate-fadeInUp">
              <span className="badge-custom mb-3">
                <i className="bi bi-star-fill me-2"></i>
                Tradición Patagónica
              </span>
              <h1 className="display-3 fw-bold text-primary-custom mb-4">
                Los Mejores Mates <span className="text-accent-custom">Artesanales</span>
              </h1>
              <p className="lead text-dark mb-4">
                Descubre nuestra selección de mates y bombillas de calidad premium. Elaborados con materiales nobles y
                diseños únicos que reflejan la esencia de la Patagonia.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-4">
                <button className="btn btn-primary-custom" onClick={handleCatalogoClick}>
                  <i className="bi bi-bag-check me-2"></i>
                  Ver Catálogo
                </button>
                <button className="btn btn-outline-custom" onClick={handleWhatsAppClick}>
                  <i className="bi bi-whatsapp me-2"></i>
                  Consultar
                </button>
              </div>
              <div className="d-flex flex-wrap gap-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <small>Envíos a todo el país</small>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <small>Productos artesanales</small>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <small>Garantía de calidad</small>
                </div>
              </div>
            </div>
            <div className="col-lg-6 animate-fadeInUp animate-delay-1">
              <div className="position-relative">
                <img
                  src={mates || "/placeholder.svg"}
                  alt="Mates El Patagónico"
                  className="img-fluid rounded-4 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="productos" className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title display-5">Productos Destacados</h2>
            <p className="lead text-muted">Nuestra selección de mates y accesorios más populares</p>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando productos...</span>
              </div>
              <p className="mt-3 text-muted">Cargando productos destacados...</p>
            </div>
          ) : hasError ? (
            <div className="alert alert-warning text-center" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {categoriesError || productsError || "Error al cargar los productos"}
            </div>
          ) : !hasProducts ? (
            <div className="text-center py-5">
              <i className="bi bi-box-seam fs-1 text-muted mb-3"></i>
              <p className="text-muted">No hay productos disponibles en este momento.</p>
              <button 
                className="btn btn-primary-custom mt-3"
                onClick={() => {
                  dispatch(fetchProducts())
                  dispatch(fetchCategories())
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {featuredProducts.map((product, index) => (
                  <div
                    key={product.id || index}
                    className={`col-md-6 col-lg-3 animate-fadeInUp animate-delay-${(index % 4) + 1}`}
                  >
                    <div className="card card-product h-100">
                      <div className="position-relative">
                        <img
                          src={product.imagesURL?.[0] || "https://placehold.co/400x300?text=Producto"}
                          className="card-img-top img-product"
                          alt={product.name}
                          style={{
                            height: "250px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate(`/products/${product.id}`)}
                        />
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5
                          className="card-title text-primary-custom fw-bold"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          {product.name || "Producto sin nombre"}
                        </h5>
                        <p className="card-text flex-grow-1 text-muted">
                          {product.description ? 
                            (product.description.length > 60 ? 
                              `${product.description.substring(0, 60)}...` : 
                              product.description
                            ) : 
                            "Descripción no disponible"
                          }
                        </p>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <h4 className="text-secondary-custom fw-bold mb-0">
                            ${product.price ? (product.price / 100).toFixed(2) : "0.00"}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-5">
                <button className="btn btn-primary-custom btn-lg" onClick={() => navigate("/products")}>
                  Ver Todos los Productos
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <section id="nosotros" className="py-5 bg-light-custom">
        <div className="container">
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className={`col-md-4 animate-fadeInUp animate-delay-${index + 1}`}>
                <div className="feature-card text-center p-4 h-100">
                  <div className="feature-icon">
                    <i className={`bi ${feature.icon}`}></i>
                  </div>
                  <h4 className="fw-bold text-primary-custom mb-3">{feature.title}</h4>
                  <p className="text-muted mb-0">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="py-5 bg-primary-custom text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 text-center text-lg-start mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold mb-3">¿Listo para tu mate perfecto?</h2>
              <p className="lead mb-0">Únete a miles de clientes satisfechos con nuestros productos</p>
            </div>
            <div className="col-lg-4 text-center text-lg-end">
              <button className="btn btn-accent-custom btn-lg me-2 mb-2" onClick={handleWhatsAppClick}>
                <i className="bi bi-whatsapp me-2"></i>
                Contactar
              </button>
              <button className="btn btn-outline-light btn-lg mb-2" onClick={handleInstagramClick}>
                <i className="bi bi-instagram me-2"></i>
                Seguinos
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home