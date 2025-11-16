"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../redux/features/authSlice"
import { fetchUserOrders } from "../redux/features/orderSlice"

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated, loading, token } = useSelector((state) => state.auth)
  const { orders, loading: loadingOrders } = useSelector((state) => state.orders)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/register")
      return
    }

    if (!loading && isAuthenticated && user) {
      dispatch(fetchUserOrders({ userId: user.id, token }))
    }
  }, [isAuthenticated, navigate, user, loading, token, dispatch])

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

  if (!isAuthenticated) {
    return null
  }

  const fullName =
    user?.name && user?.surname ? `${user.name} ${user.surname}` : user?.name || user?.username || "Usuario"

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          {/* User Information Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "80px", height: "80px", fontSize: "2rem" }}
                >
                  <i className="bi bi-person-fill"></i>
                </div>
                <div className="ms-4">
                  <h2 className="mb-1">{fullName}</h2>
                  <p className="text-muted mb-0">{user?.email}</p>
                </div>
              </div>

              <hr />

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="text-muted small">Nombre completo</label>
                  <p className="mb-0">{fullName}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="text-muted small">Email</label>
                  <p className="mb-0">{user?.email}</p>
                </div>
                {user?.phone_number && (
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Teléfono</label>
                    <p className="mb-0">{user.phone_number}</p>
                  </div>
                )}
                {user?.address && (
                  <div className="col-md-6 mb-3">
                    <label className="text-muted small">Dirección</label>
                    <p className="mb-0">{user.address}</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          {/* Order History Card */}
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h4 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Historial de Órdenes
              </h4>
            </div>
            <div className="card-body">
              {loadingOrders ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-bag-x fs-1 text-muted"></i>
                  <p className="text-muted mt-3">No tienes órdenes todavía</p>
                  <button className="btn btn-primary mt-2" onClick={() => navigate("/")}>
                    Ir a Comprar
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Orden #</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{new Date(order.date).toLocaleDateString("es-ES")}</td>
                          <td>${order.total?.toFixed(2)}</td>
                          <td>
                            <span
                              className={`badge ${
                                order.status === "completed"
                                  ? "bg-success"
                                  : order.status === "pending"
                                    ? "bg-warning"
                                    : order.status === "cancelled"
                                      ? "bg-danger"
                                      : "bg-secondary"
                              }`}
                            >
                              {order.status === "completed"
                                ? "Completada"
                                : order.status === "pending"
                                  ? "Pendiente"
                                  : order.status === "cancelled"
                                    ? "Cancelada"
                                    : order.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => alert(`Ver detalles de orden #${order.id}`)}
                            >
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
