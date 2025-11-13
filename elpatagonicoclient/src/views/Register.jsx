"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { registerUser, clearError } from "../redux/features/authSlice"
import { useNavigate, Link } from "react-router-dom"
import logo from "../assets/logo.jpeg"

const Register = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    surname: "",
    phone: "",
  })

  const [localError, setLocalError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setLocalError("")
    dispatch(clearError())
  }

  const validatePhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, "")
    return digitsOnly.length === 10
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError("")

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      setLocalError("El teléfono debe tener exactamente 10 dígitos")
      return
    }

    const result = await dispatch(
      registerUser({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phone_number: formData.phone ? Number.parseInt(formData.phone.replace(/\D/g, "")) : null,
        password: formData.password,
      }),
    )

    if (registerUser.fulfilled.match(result)) {
      setSuccess(true)
      setTimeout(() => navigate("/"), 1500)
    }
  }

  const displayError = localError || error

  return (
    <div className="bg-light-custom py-5" style={{ minHeight: "100vh", paddingTop: "100px" }}>
      <div className="container">
        <div className="auth-card bg-white p-4 p-md-5">
          <div className="text-center mb-4">
            <img
              src={logo || "/placeholder.svg"}
              alt="Mates El Patagónico"
              height="80"
              className="mb-3"
              style={{ borderRadius: "50%" }}
            />
            <h2 className="text-primary-custom fw-bold mb-2">Crear Cuenta</h2>
            <p className="text-muted">Únete a la familia de Mates El Patagónico</p>
          </div>

          {displayError && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{displayError}</div>
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              <div>Registro exitoso! Redirigiendo...</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className="form-label fw-semibold">
                  <i className="bi bi-person-fill me-2 text-primary-custom"></i>
                  Nombre
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Juan"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="surname" className="form-label fw-semibold">
                  <i className="bi bi-person-fill me-2 text-primary-custom"></i>
                  Apellido
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                <i className="bi bi-envelope me-2 text-primary-custom"></i>
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label fw-semibold">
                <i className="bi bi-phone me-2 text-primary-custom"></i>
                Teléfono
              </label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="1123456789 (10 dígitos)"
                maxLength="10"
              />
              <small className="text-muted">Ingresa 10 dígitos sin espacios ni guiones</small>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                <i className="bi bi-lock me-2 text-primary-custom"></i>
                Contraseña
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label fw-semibold">
                <i className="bi bi-lock-fill me-2 text-primary-custom"></i>
                Confirmar Contraseña
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repite tu contraseña"
              />
            </div>

            <button type="submit" className="btn btn-primary-custom w-100 mb-3" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Registrando...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Crear Cuenta
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-muted mb-0">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-primary-custom fw-semibold text-decoration-none">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
