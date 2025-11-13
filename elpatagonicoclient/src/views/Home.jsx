"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { fetchCategories } from "../redux/features/CategorySlice"
import { fetchProducts } from "../redux/features/productSlice"
import mates from "../assets/mates.png"

const EXTERNAL_LINKS = {
  whatsapp: "https://wa.me/1234567890", // Reemplazar con tu número de WhatsApp
  instagram: "https://instagram.com/tu_cuenta", // Reemplazar con tu cuenta de Instagram
  catalogo: "/products", // URL del catálogo (puede ser externa o ruta interna)
}

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories)
  const { list: products, loading: productsLoading } = useAppSelector((state) => state.products)

  const [productList, setProductList] = useState([])
  const [error, setError] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

  useEffect(() => {
    console.log("[v0] Home - Dispatching fetchCategories and fetchProducts")
    dispatch(fetchCategories())
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    console.log("[v0] Home - Categories:", categories)
    console.log("[v0] Home - Products from Redux:", products)
  }, [categories, products])

  useEffect(() => {
    // Obteniendo una pequeña lista de productos para mostrar
    const fetchHomeProducts = async () => {
      try {
        console.log("[v0] Home - fetchHomeProducts starting")
        const categoryList = categories.content || categories
        console.log("[v0] Home - Category list:", categoryList)

        const categoriesToShow = categoryList.slice(0, 4)
        const productsArray = []

        // Recorrer cada categoría y obtener un producto
        for (const category of categoriesToShow) {
          try {
            // Obtener productos de esta categoría
            const url = `${API_URL}/api/products/search/category/${category.id}`
            console.log("[v0] Home - Fetching products from category:", url)

            const productsByCategoryResponse = await fetch(url)

            if (!productsByCategoryResponse.ok) {
              console.warn(`[v0] Home - No se pudieron cargar productos de la categoría ${category.id}`)
              continue
            }

            const productsByCategoryData = await productsByCategoryResponse.json()
            console.log("[v0] Home - Products by category data:", productsByCategoryData)

            // Extraer el primer producto
            const products = productsByCategoryData.content || productsByCategoryData

            if (products && products.length > 0) {
              const product = products[0]
              productsArray.push(product)
            }
          } catch (err) {
            console.error(`[v0] Home - Error fetching products for category ${category.id}:`, err)
          }
        }

        console.log("[v0] Home - Final products array:", productsArray)
        setProductList(productsArray)
        setError(null)
      } catch (err) {
        console.error("[v0] Home - Error en fetchHomeProducts:", err)
        setError(err.message)
      }
    }

    if (categories && categories.length > 0) {
      fetchHomeProducts()
    }
  }, [categories, API_URL])

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

  const loading = categoriesLoading || productsLoading

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

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando productos...</span>
              </div>
              <p className="mt-3 text-muted">Cargando productos destacados...</p>
            </div>
          ) : error ? (
            <div className="alert alert-warning text-center" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : productList.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box-seam fs-1 text-muted mb-3"></i>
              <p className="text-muted">No hay productos disponibles en este momento.</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {productList.map((product, index) => (
                  <div
                    key={product.id}
                    className={`col-md-6 col-lg-3 animate-fadeInUp animate-delay-${(index % 3) + 1}`}
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
                          {product.name}
                        </h5>
                        <p className="card-text flex-grow-1">{product.description?.substring(0, 60)}...</p>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <h4 className="text-secondary-custom fw-bold mb-0">${(product.price / 100).toFixed(2)}</h4>
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
