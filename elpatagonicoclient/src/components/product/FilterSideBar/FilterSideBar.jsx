import React from 'react';
// Ya no necesitamos importar './FilterSidebar.css' ya que usaremos clases de Bootstrap

const FilterSidebar = ({ categories, filters, onFilterChange }) => {
    
    // Función para manejar el cambio de categoría (Checkbox)
    const handleCategoryChange = (e) => {
        // Usamos 'name' que contiene el ID, y lo convertimos a número
        const categoryId = Number(e.target.name);
        const { checked } = e.target;
        onFilterChange('category', categoryId, checked);
    };

    // Función para manejar el cambio del rango de precio (Slider)
    const handlePriceChange = (e) => {
        const { value } = e.target;
        onFilterChange('price', 'max', Number(value));
    };

    return (
        // Usamos 'card' para un look amigable de Bootstrap
        // Usamos 'sticky-top' para que se mantenga en la parte superior al hacer scroll
        <aside className='card shadow-sm p-3 mb-4 sticky-top' style={{ top: '20px' }}>
            <h2 className='card-title h4 border-bottom pb-2 mb-3 text-primary'>
                <i className="bi bi-funnel-fill me-2"></i>
                Filtros
            </h2>

            {/* Separador de Categorías */}
            <div className='mb-4'>
                <h3 className='h6 text-uppercase fw-bold mb-3'>Categorías</h3>
                <div className='list-group list-group-flush'>
                    {categories.map((category) => (
                        <div key={category.id} className='form-check py-1'>
                            <input 
                                className="form-check-input"
                                type="checkbox"
                                id={`cat-${category.id}`} // ID único para el label
                                name={category.id} // El 'name' ahora es el ID
                                checked={filters.selectedCategoryIds.has(category.id)} 
                                onChange={handleCategoryChange}
                            />
                            <label className="form-check-label" htmlFor={`cat-${category.id}`}>
                                {category.description}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Separador de Rango de Precios */}
            <div className='border-top pt-3'>
                <h3 className='h6 text-uppercase fw-bold mb-3'>Rango de Precios</h3>
                
                {/* Input de Rango (Slider) de Bootstrap */}
                <input
                    type="range"
                    className="form-range"
                    id="price-range-slider"
                    min="0"
                    // Nota: Usé un valor máximo fijo para el ejemplo. Ajusta 'max' según tus productos.
                    max="70000" 
                    step="100"
                    value={filters.priceRange.max}
                    onChange={handlePriceChange}
                />
                
                {/* Etiquetas de Precios */}
                <div className="d-flex justify-content-between mt-2">
                    <span className="fw-semibold text-muted">$0</span>
                    <span className="fw-bold text-success">
                        Máx: ${filters.priceRange.max.toLocaleString('es-AR')}
                    </span>
                </div>
            </div>
        </aside>
    );
}

export default FilterSidebar;