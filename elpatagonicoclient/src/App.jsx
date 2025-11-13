import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/navbar/Navbar"
import Footer from "./components/footer/Footer"
import Home from "./views/Home"
import Register from "./views/Register"
import Favorites from "./views/Favoritos"
import Profile from "./views/Profile"
import Login from "./views/Login"
import Products from "./views/Products"
import CartView from "./views/CartView"
import ProductDetail from "./views/ProductDetail"
import AdminDashboard from "./views/AdminDashboard"
import Checkout from "./views/Checkout"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen font-inter bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Rutas Principales */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Rutas de E-commerce */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/cart" element={<CartView />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Otras Rutas */}
            <Route
              path="/forgot-password"
              element={<h2 className="text-center mt-5 text-xl font-semibold">Recuperar contraseña</h2>}
            />

            {/* Ruta 404 (siempre al final) */}
            <Route
              path="*"
              element={
                <h2 className="text-center mt-12 text-2xl font-bold text-red-600">404 - Página no encontrada</h2>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App
