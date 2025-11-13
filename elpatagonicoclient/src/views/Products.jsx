"use client"

import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { fetchProducts } from "../redux/features/productSlice"
import { fetchCategories } from "../redux/features/CategorySlice"
import ProductList from "../components/product/productlist/ProductList"
import FilterSidebar from "../components/product/FilterSideBar/FilterSideBar"

const Products = () => {
  const isMounted = useRef(true)
  const dispatch = useAppDispatch()

  const { products, loading: productsLoading, error: productsError } = useAppSelector((state) => state.products)
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories)

  const [displayedProducts, setDisplayedProducts] = useState([])
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    selectedCategoryIds: new Set(),
    priceRange: { max: 69500 },
    sortDirection: "asc",
  })

  useEffect(() => {
    console.log("[v0] Products component mounted")
    isMounted.current = true
    window.scrollTo({ top: 0, behavior: "smooth" })

    return () => {
      console.log("[v0] Products component unmounting")
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    console.log("[v0] Fetching products with filters:", filters)

    if (!isMounted.current) return

    dispatch(fetchProducts())
  }, [filters, dispatch])

  useEffect(() => {
    if (products && products.length > 0) {
      let filtered = [...products]

      // Filtrar por categoría
      if (filters.selectedCategoryIds.size > 0) {
        filtered = filtered.filter((product) => filters.selectedCategoryIds.has(product.category?.id))
      }

      // Filtrar por precio
      filtered = filtered.filter((product) => product.price <= filters.priceRange.max)

      // Ordenar por precio
      filtered.sort((a, b) => {
        if (filters.sortDirection === "asc") {
          return a.price - b.price
        } else {
          return b.price - a.price
        }
      })

      console.log("[v0] Products after filtering:", filtered.length)
      setDisplayedProducts(filtered)
    }
  }, [products, filters])

  useEffect(() => {
    if (productsError) {
      setError(productsError)
    }
  }, [productsError])

  const handleFilterChange = (filterType, key, value) => {
    console.log("[v0] Filter change:", { filterType, key, value })

    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters }

      if (filterType === "category") {
        const newCategoryIds = new Set(prevFilters.selectedCategoryIds)
        if (value) newCategoryIds.add(key)
        else newCategoryIds.delete(key)
        newFilters.selectedCategoryIds = newCategoryIds
      }

      if (filterType === "price") {
        newFilters.priceRange = { ...prevFilters.priceRange, [key]: value }
      }

      if (filterType === "sort") {
        newFilters.sortDirection = value
      }

      console.log("[v0] New filters:", newFilters)
      return newFilters
    })
  }

  const allCategories = categories.content || categories || []
  const isLoading = productsLoading || categoriesLoading

  console.log(
    "[v0] Rendering Products component. Loading:",
    isLoading,
    "Error:",
    error,
    "Products count:",
    displayedProducts.length,
  )

  if (error) {
    return (
      <div className="products-page-container">
        <div className="error-container">
          <h2>Error al cargar productos</h2>
          <p className="error-message">{error}</p>
          <div className="error-instructions">
            <h3>Para solucionar este problema:</h3>
            <ol>
              <li>Asegúrate de que MySQL esté corriendo en el puerto 3306</li>
              <li>Verifica que la base de datos marketplace exista</li>
              <li>
                Inicia el servidor backend desde la carpeta elpatagonicoserver:
                <pre>./mvnw spring-boot:run</pre>o en Windows:
                <pre>mvnw.cmd spring-boot:run</pre>
              </li>
              <li>El servidor debe estar corriendo en http://localhost:8080</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="products-page-container fade-in">
      <div className="products-page-filters-container">
        <FilterSidebar categories={allCategories} filters={filters} onFilterChange={handleFilterChange} />
      </div>

      <div className="products-page-list-container">
        <h2>Nuestros productos</h2>

        <div className="sort-container mb-3">
          <label htmlFor="sort-select" className="me-2 fw-bold">
            Ordenar por:
          </label>
          <select
            id="sort-select"
            value={filters.sortDirection}
            onChange={(e) => handleFilterChange("sort", "sortDirection", e.target.value)}
          >
            <option value="asc">Precio: Menor a Mayor</option>
            <option value="desc">Precio: Mayor a Menor</option>
          </select>
        </div>

        {isLoading ? <p>Cargando productos...</p> : <ProductList products={displayedProducts} />}
      </div>
    </div>
  )
}

export default Products
