"use client"
/**
 * CartView sería el componente "lógico" que, usando Redux, renderiza
 */
import { useNavigate } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "../redux/hooks"
import { removeFromCart, incrementQuantity, decrementQuantity } from "../redux/features/cartSlice"
import NewCart from "../components/cart/NewCart" // El componente de presentación sigue siendo útil

const CartView = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { user, loading: authLoading } = useAppSelector((state) => state.auth)
  const { items: cartItems, totalAmount, loading: cartIsLoading, error } = useAppSelector((state) => state.cart)

  const isAuthenticated = !!user

  // 1. Para mostrar que está cargando y no dejar la vista en blanco
  if (authLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border cart-spinner" role="status"></div>
          <p className="mt-3 text-muted">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // 2. Mensaje para usuario no autenticado
  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="empty-cart-container text-center">
          <div className="empty-cart-icon">
            <i className="bi bi-person-lock"></i>
          </div>
          <h2 className="empty-cart-title">Inicia sesión para ver tu carrito</h2>
          <button onClick={() => navigate("./Login")} className="btn btn-cart-primary">
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  // 3. "Cargando"
  if (cartIsLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border cart-spinner" role="status"></div>
          <p className="mt-3 text-muted">Cargando tu carrito...</p>
        </div>
      </div>
    )
  }

  // 4. Mensaje de error
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning cart-alert" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  // 5. Mensaje de carrito vacío
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="empty-cart-container text-center">
          <div className="empty-cart-icon">
            <i className="bi bi-cart-x"></i>
          </div>
          <h2 className="empty-cart-title">Tu carrito está vacío</h2>
          <p className="empty-cart-text">Agrega productos para comenzar tu pedido</p>
          <button
            onClick={() => {
              navigate("/Products")
            }}
            className="btn btn-cart-primary"
          >
            Explora nuestros productos
          </button>
        </div>
      </div>
    )
  }

  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromCart(itemId))
  }

  const handleIncrementQuantity = (itemId) => {
    dispatch(incrementQuantity(itemId))
  }

  const handleDecrementQuantity = (itemId) => {
    dispatch(decrementQuantity(itemId))
  }

  // Si todo está correcto, renderizamos el carrito
  return (
    <div className="container py-5">
      <NewCart
        items={cartItems}
        totalAmount={totalAmount}
        onItemRemove={handleRemoveFromCart}
        onIncrementQuantity={handleIncrementQuantity}
        onDecrementQuantity={handleDecrementQuantity}
      />
    </div>
  )
}

export default CartView
