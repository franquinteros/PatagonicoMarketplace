"use client" //qué es esto?

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { clearCart } from "../redux/features/cartSlice"
import { fetchPaymentMethods } from "../redux/features/paymentMethodSlice"
import { fetchDeliveryTypes } from "../redux/features/deliveryTypeSlice"
import { createOrder, clearOrderError } from "../redux/features/orderSlice"

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { isAuthenticated, loading: authLoading, user, token } = useSelector((state) => state.auth)
  const { items: cartItems, totalAmount } = useSelector((state) => state.cart)
  const { list: paymentMethods, loading: paymentLoading } = useSelector((state) => state.paymentMethods)
  const { list: deliveryTypes, loading: deliveryLoading } = useSelector((state) => state.deliveryTypes)
  const { loading: orderLoading, error: orderError } = useSelector((state) => state.orders)

  // Estados para los datos del checkout
  const [cartId, setCartId] = useState(null)

  // Estados para las selecciones del usuario
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [selectedDeliveryType, setSelectedDeliveryType] = useState(null)

  // Estados de UI
  const [error, setError] = useState(null)
  const API_URL = "http://localhost:8080/api"

  useEffect(() => {
    const fetchCheckoutData = async () => {
      if (!isAuthenticated || !user?.id) {
        return
      }

      try {
        setError(null)

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }

        // Obtener cartId desde los items del carrito
        const cartResponse = await fetch(`${API_URL}/cart/items/${user.id}`, { headers })
        if (!cartResponse.ok) throw new Error("Error al cargar el carrito")
        const cartData = await cartResponse.json()

        if (cartData && cartData.length > 0) {
          setCartId(cartData[0].cart)
        }

        dispatch(fetchPaymentMethods())
        dispatch(fetchDeliveryTypes())
      } catch (err) {
        console.error("Error fetching checkout data:", err)
        setError(err.message)
      }
    }

    fetchCheckoutData()
  }, [isAuthenticated, user?.id, token, dispatch])

  useEffect(() => {
    if (orderError) {
      setError(orderError)
    }
  }, [orderError])

  const handleCheckout = async () => {
    if (!selectedPaymentMethod || !selectedDeliveryType) {
      setError("Por favor selecciona un método de pago y tipo de entrega")
      return
    }
    if (!cartId) {
      setError("No se encontró el carrito")
      return
    }

    try {
      setError(null)
      dispatch(clearOrderError())

      const orderRequest = {
        cartId: cartId,
        userId: user.id,
        deliveryType: selectedDeliveryType,
        paymentMethod: selectedPaymentMethod,
      }

      const result = await dispatch(createOrder({ orderData: orderRequest, token })).unwrap()

      console.log("Checkout success:", result)

      await dispatch(clearCart({ userId: user.id, token })).unwrap()

      // Redirigir a confirmación
      navigate(`/order-confirmation/${result.id}`)
    } catch (err) {
      console.error("Error al procesar la orden:", err)
      setError(err)
    }
  }

  const loading = authLoading || paymentLoading || deliveryLoading

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información de pago...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Debes iniciar sesión para realizar un pedido.
          <button className="btn btn-primary ms-3" onClick={() => navigate("/login")}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          <i className="bi bi-cart-x me-2"></i>
          Tu carrito está vacío. Agrega productos antes de continuar.
          <button className="btn btn-primary ms-3" onClick={() => navigate("/products")}>
            Ver Productos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8">
          <h2 className="mb-4">
            <i className="bi bi-credit-card me-2"></i>
            Checkout
          </h2>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          {/* Métodos de Pago */}
          <div className="payment-methods-display-container mb-4">
            <h4 className="mb-3">Método de Pago</h4>
            <div className="row g-3">
              {paymentMethods.length === 0 ? (
                <p className="text-muted">No hay métodos de pago disponibles</p>
              ) : (
                paymentMethods.map((method) => (
                  <div key={method.id} className="col-md-6">
                    <div
                      className={`card h-100 cursor-pointer ${selectedPaymentMethod === method.id ? "border-primary" : ""}`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="card-body">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id={`payment-${method.id}`}
                            checked={selectedPaymentMethod === method.id}
                            onChange={() => setSelectedPaymentMethod(method.id)}
                          />
                          <label className="form-check-label w-100" htmlFor={`payment-${method.id}`}>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-credit-card fs-4 me-3"></i>
                              <div>
                                <h6 className="mb-0">{method.description}</h6>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tipos de Entrega */}
          <div className="delivery-types-display-container mb-4">
            <h4 className="mb-3">Tipo de Entrega</h4>
            <div className="row g-3">
              {deliveryTypes.length === 0 ? (
                <p className="text-muted">No hay tipos de entrega disponibles</p>
              ) : (
                deliveryTypes.map((delivery) => (
                  <div key={delivery.id} className="col-md-6">
                    <div
                      className={`card h-100 cursor-pointer ${selectedDeliveryType === delivery.id ? "border-primary" : ""}`}
                      onClick={() => setSelectedDeliveryType(delivery.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="card-body">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="deliveryType"
                            id={`delivery-${delivery.id}`}
                            checked={selectedDeliveryType === delivery.id}
                            onChange={() => setSelectedDeliveryType(delivery.id)}
                          />
                          <label className="form-check-label w-100" htmlFor={`delivery-${delivery.id}`}>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-truck fs-4 me-3"></i>
                              <div>
                                <h6 className="mb-0">{delivery.description}</h6>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Resumen del Pedido */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: "20px" }}>
            <div className="card-body">
              <h5 className="card-title mb-4">Resumen del Pedido</h5>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Productos ({cartItems.length})</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Envío</span>
                  <span className="text-success">Gratis</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary w-100 mb-2"
                onClick={handleCheckout}
                disabled={orderLoading || !selectedPaymentMethod || !selectedDeliveryType}
              >
                {orderLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Confirmar Pedido
                  </>
                )}
              </button>

              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => navigate("/cart")}
                disabled={orderLoading}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Carrito
              </button>

              <div className="mt-3 text-center">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  Compra segura y protegida
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
