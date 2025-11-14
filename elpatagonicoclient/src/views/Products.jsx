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

  const { list: products, loading: productsLoading, error: productsError } = useAppSelector((state) => state.products)
  const { list: categories, loading: categoriesLoading, error: categoriesError } = useAppSelector((state) => state.categories)

  const [displayedProducts, setDisplayedProducts] = useState([])
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    selectedCategoryIds: new Set(),
    priceRange: { max: 69500 },
    sortDirection: "asc",
  })

  useEffect(() => {
    console.log("[v2] Products component mounted")
    isMounted.current = true
    window.scrollTo({ top: 0, behavior: "smooth" })

    // Cargar datos iniciales
    console.log("[v2] Dispatching initial data fetch")
    dispatch(fetchCategories())
    dispatch(fetchProducts())

    return () => {
      console.log("[v2] Products component unmounting")
      isMounted.current = false
    }
  }, [dispatch])

  useEffect(() => {
    console.log("[v2] Categories state:", { 
      categories, 
      categoriesLoading, 
      categoriesError,
      categoriesLength: categories?.length 
    })
  }, [categories, categoriesLoading, categoriesError])

  useEffect(() => {
    console.log("[v2] Products state:", { 
      products, 
      productsLoading, 
      productsError,
      productsLength: products?.length,
      firstProduct: products?.[0] // Para ver la estructura
    })
  }, [products, productsLoading, productsError])

  // Aplicar filtros cuando cambien los productos o los filtros
  useEffect(() => {
    if (products && products.length > 0) {
      console.log("[v2] Applying filters to", products.length, "products")
      console.log("[v2] Current filters:", {
        selectedCategoryIds: Array.from(filters.selectedCategoryIds),
        priceRange: filters.priceRange,
        sortDirection: filters.sortDirection
      })
      
      let filtered = [...products]

      // Filtrar por categoría - CORREGIDO
      if (filters.selectedCategoryIds.size > 0) {
        console.log("[v2] Filtering by categories:", Array.from(filters.selectedCategoryIds))
        
        filtered = filtered.filter((product) => {
          // Diferentes formas en que la categoría puede estar estructurada
          const productCategoryId = 
            product.category?.id || 
            product.categoryId || 
            product.category
          
          console.log(`[v2] Product ${product.id} - Category ID:`, productCategoryId, 
                     'Product category object:', product.category)
          
          const hasCategory = filters.selectedCategoryIds.has(productCategoryId)
          console.log(`[v2] Product ${product.id} - Matches: ${hasCategory}`)
          return hasCategory
        })
        
        console.log("[v2] After category filtering:", filtered.length, "products")
      }

      // Filtrar por precio - CORREGIDO
      if (filters.priceRange.max > 0) {
        filtered = filtered.filter((product) => {
          // Asegurarse de que el precio sea un número
          const productPrice = Number(product.price) || 0
          const passesPriceFilter = productPrice <= filters.priceRange.max
          
          console.log(`[v2] Product ${product.id} - Price: ${productPrice}, Max: ${filters.priceRange.max}, Passes: ${passesPriceFilter}`)
          return passesPriceFilter
        })
        
        console.log("[v2] After price filtering:", filtered.length, "products")
      }

      // Ordenar por precio - CORREGIDO
      filtered.sort((a, b) => {
        const priceA = Number(a.price) || 0
        const priceB = Number(b.price) || 0
        
        if (filters.sortDirection === "asc") {
          return priceA - priceB
        } else {
          return priceB - priceA
        }
      })

      console.log("[v2] Final filtered products:", filtered.length)
      console.log("[v2] Sample filtered products:", filtered.slice(0, 3))
      setDisplayedProducts(filtered)
    } else if (products && products.length === 0) {
      console.log("[v2] No products available")
      setDisplayedProducts([])
    }
  }, [products, filters])

  // Manejo de errores
  useEffect(() => {
    if (productsError || categoriesError) {
      const errorMessage = productsError || categoriesError
      console.error("[v2] Error detected:", errorMessage)
      setError(errorMessage)
    } else {
      setError(null)
    }
  }, [productsError, categoriesError])

  const handleFilterChange = (filterType, key, value) => {
    console.log("[v2] Filter change:", { filterType, key, value })

    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters }

      if (filterType === "category") {
        const newCategoryIds = new Set(prevFilters.selectedCategoryIds)
        if (value) {
          newCategoryIds.add(Number(key)) // Asegurar que sea número
          console.log("[v2] Added category:", key, "Current categories:", Array.from(newCategoryIds))
        } else {
          newCategoryIds.delete(Number(key)) // Asegurar que sea número
          console.log("[v2] Removed category:", key, "Current categories:", Array.from(newCategoryIds))
        }
        newFilters.selectedCategoryIds = newCategoryIds
      }

      if (filterType === "price") {
        newFilters.priceRange = { ...prevFilters.priceRange, [key]: Number(value) }
        console.log("[v2] New price range:", newFilters.priceRange)
      }

      if (filterType === "sort") {
        newFilters.sortDirection = value
        console.log("[v2] New sort direction:", value)
      }

      console.log("[v2] Updated filters:", newFilters)
      return newFilters
    })
  }

  const handleClearFilters = () => {
    console.log("[v2] Clearing all filters")
    setFilters({
      selectedCategoryIds: new Set(),
      priceRange: { max: 69500 },
      sortDirection: "asc",
    })
  }

  const handleRetry = () => {
    console.log("[v2] Retrying data fetch...")
    setError(null)
    dispatch(fetchCategories())
    dispatch(fetchProducts())
  }

  // Manejo seguro de categorías
  const allCategories = Array.isArray(categories) ? categories : []
  const isLoading = productsLoading || categoriesLoading
  const hasActiveFilters = filters.selectedCategoryIds.size > 0 || filters.priceRange.max < 69500

  console.log("[v2] Final render state:", {
    isLoading,
    error,
    categoriesCount: allCategories.length,
    productsCount: displayedProducts.length,
    hasActiveFilters,
    filters
  })

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
            <button className="btn btn-primary-custom mt-3" onClick={handleRetry}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="products-page-container fade-in">
      <div className="products-page-filters-container">
        <FilterSidebar 
          categories={allCategories} 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </div>

      <div className="products-page-list-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Nuestros productos</h2>
          
          {hasActiveFilters && (
            <button 
              className="btn btn-outline-custom btn-sm"
              onClick={handleClearFilters}
            >
              <i className="bi bi-x-circle me-2"></i>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Información de estado */}
        <div className="products-info-bar mb-4">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="sort-container">
                <label htmlFor="sort-select" className="me-2 fw-bold">
                  Ordenar por:
                </label>
                <select
                  id="sort-select"
                  value={filters.sortDirection}
                  onChange={(e) => handleFilterChange("sort", "sortDirection", e.target.value)}
                  className="form-select"
                  style={{ width: "auto" }}
                >
                  <option value="asc">Precio: Menor a Mayor</option>
                  <option value="desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>
            
            <div className="col-md-6 text-md-end">
              <div className="products-count">
                {isLoading ? (
                  <span>Cargando...</span>
                ) : (
                  <span>
                    {displayedProducts.length} de {products?.length || 0} productos
                    {filters.selectedCategoryIds.size > 0 && 
                      ` · ${filters.selectedCategoryIds.size} categoría(s) seleccionada(s)`}
                    {filters.priceRange.max < 69500 && 
                      ` · Precio máximo: $${filters.priceRange.max.toLocaleString('es-AR')}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando productos...</span>
            </div>
            <p className="mt-3 text-muted">Cargando productos...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-funnel-x fs-1 text-muted mb-3"></i>
            <h4 className="text-muted mb-3">No se encontraron productos</h4>
            <p className="text-muted mb-4">
              {hasActiveFilters 
                ? "No hay productos que coincidan con los filtros aplicados."
                : "No hay productos disponibles en este momento."
              }
            </p>
            {hasActiveFilters && (
              <button 
                className="btn btn-primary-custom"
                onClick={handleClearFilters}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <ProductList products={displayedProducts} />
        )}
      </div>
    </div>
  )
}

export default Products