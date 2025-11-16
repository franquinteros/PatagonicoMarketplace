"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { fetchWishlist } from "../redux/features/wishlistSlice"
import ProductCard from "../components/product/productcard/ProductCard"
import AuthModal from "../components/authmodal/AuthModal"

const API_URL = "http://localhost:8080"

const Favoritos = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { items: wishlistItems, loading: isLoadingWishlist } = useSelector((state) => state.wishlist)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchWishlist(user.id))
    }
  }, [isAuthenticated, user?.id, dispatch])

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!isAuthenticated) {
        setProducts([])
        setLoading(false)
        return
      }

      if (wishlistItems.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const requests = wishlistItems.map(async (item) => {
          const productId = typeof item === 'number' ? item : (item.id || item.productId)
          const url = `${API_URL}/api/products/search/id/${productId}`

          const res = await fetch(url)

          if (!res.ok) {
            console.error(`[Favoritos] Error fetching product ${productId}: ${res.status}`)
            throw new Error(`Error fetching product ${productId}`)
          }

          return await res.json()
        })

        const results = await Promise.allSettled(requests)
        const validProducts = results.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value)

        setProducts(validProducts)
      } catch (e) {
        console.error("[Favoritos] Error al obtener favoritos:", e)
        setError("Hubo un problema al cargar tus favoritos.")
      } finally {
        setLoading(false)
      }
    }

    if (!isLoadingWishlist) {
      fetchWishlistProducts()
    }
  }, [wishlistItems, isAuthenticated, isLoadingWishlist])

  if (!isAuthenticated) return <AuthModal />

  return (
    <div className="container my-5">
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-heart-fill text-danger fs-1 me-3"></i>
        <div>
          <h1 className="mb-0">Mis Favoritos</h1>
          <p className="text-muted mb-0">
            {wishlistItems.length} {wishlistItems.length === 1 ? "producto" : "productos"} en tu lista
          </p>
        </div>
      </div>

      {loading || isLoadingWishlist ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando tus favoritos...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-heart fs-1 text-muted"></i>
          <h3 className="mt-3">No tienes favoritos todavía</h3>
          <p className="text-muted">
            Explora nuestros productos y agrega tus favoritos haciendo clic en el ícono de corazón.
          </p>
          <button className="btn btn-primary mt-3" onClick={() => navigate("/products")}>
            <i className="bi bi-shop me-2"></i> Explorar Productos
          </button>
        </div>
      ) : (
        <div className="row">
          {products.map((product) => (
            <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Favoritos
