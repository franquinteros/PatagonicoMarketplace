"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginUser, clearError } from "../redux/features/authSlice"
import { Link, useNavigate } from "react-router-dom"
import logo from "../assets/logo.jpeg"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const dispatch = useDispatch()
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = String(user.role || "").toUpperCase()
      if (userRole === "ADMIN" || userRole === "ROLE_ADMIN") {
        navigate("/admin")
      } else {
        navigate("/")
      }
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await dispatch(loginUser({ email, password }))

    if (loginUser.fulfilled.match(result)) {
      const userRole = String(result.payload.user.role || "").toUpperCase()
      if (userRole === "ADMIN" || userRole === "ROLE_ADMIN") {
        navigate("/admin")
      } else {
        navigate("/")
      }
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FAF9F6 0%, #e8e6e0 100%)",
      }}
    >
      <div
        className="position-absolute rounded-circle"
        style={{
          width: "400px",
          height: "400px",
          background: "linear-gradient(135deg, #8B4513, #A0522D)",
          opacity: "0.1",
          top: "-200px",
          left: "-200px",
          animation: "float 20s infinite ease-in-out",
        }}
      />
      <div
        className="position-absolute rounded-circle"
        style={{
          width: "300px",
          height: "300px",
          background: "linear-gradient(135deg, #DAA520, #F4C430)",
          opacity: "0.1",
          bottom: "-150px",
          right: "-150px",
          animation: "float 20s infinite ease-in-out 7s",
        }}
      />

      <div
        className="card border-0 position-relative"
        style={{
          maxWidth: "440px",
          width: "100%",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(139, 69, 19, 0.2)",
          animation: "slideUp 0.6s ease-out",
          zIndex: 2,
        }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div
              className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #8B4513, #A0522D)",
                boxShadow: "0 8px 24px rgba(139, 69, 19, 0.25)",
                animation: "pulse 2s ease-in-out infinite",
                overflow: "hidden",
              }}
            >
              <img
                src={logo || "/placeholder.svg"}
                alt="Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <h2 className="h3 fw-bold mb-2" style={{ color: "#1a1a1a" }}>
              Bienvenido
            </h2>
            <p className="text-muted mb-0">Inicia sesión en tu cuenta</p>
          </div>

          {error && (
            <div
              className="alert d-flex align-items-center gap-3 mb-4"
              style={{
                background: "linear-gradient(135deg, #FFF5F5, #FED7D7)",
                border: "1px solid #FC8181",
                borderRadius: "12px",
                color: "#C53030",
                animation: "shake 0.5s ease-in-out",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <circle cx="12" cy="16" r="0.5" fill="currentColor" />
              </svg>
              <span className="fw-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label fw-semibold">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4 position-relative">
              <label htmlFor="password" className="form-label fw-semibold">
                Contraseña
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                style={{
                  paddingRight: "48px",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn position-absolute border-0 bg-transparent p-0 transition-ease"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{
                  right: "12px",
                  top: "43%",
                  transform: "translateY(5px)",
                  cursor: "pointer",
                  color: "#8B4513",
                  opacity: "0.7",
                }}
                tabIndex="-1"
              >
                {showPassword ? <i className="bi bi-eye-fill fs-5"></i> : <i className="bi bi-eye-slash-fill fs-5"></i>}
              </button>
            </div>

            <button
              type="submit"
              className="btn w-100 fw-bold"
              style={{
                background: "linear-gradient(135deg, #DAA520 0%, #F4C430 100%)",
                color: "#1a1a1a",
                boxShadow: "0 4px 12px rgba(218, 165, 32, 0.4)",
              }}
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link
              to="/register"
              className="text-decoration-none fw-bold"
              style={{
                fontSize: "14px",
                color: "#DAA520",
              }}
            >
              Crear una cuenta
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .transition-ease {
          transition: opacity 0.2s ease-in-out, color 0.2s ease-in-out;
        }
        .btn:hover.transition-ease {
          opacity: 1 !important;
          color: #A0522D !important;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  )
}

export default Login
