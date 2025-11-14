import React, { useState, useEffect } from 'react';
import './FilterSidebar.css'; // Asegúrate de importar el CSS

const FilterSidebar = ({ categories = [], filters, onFilterChange }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [openSections, setOpenSections] = useState({
        categories: true,
        price: true
    });

    const handleCategoryChange = (e) => {
        const categoryId = Number(e.target.name);
        const { checked } = e.target;
        onFilterChange('category', categoryId, checked);
    };

    const handlePriceChange = (e) => {
        const { value } = e.target;
        onFilterChange('price', 'max', Number(value));
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleMobileSidebar = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    // Configurar estado inicial basado en el tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileOpen(true);
            } else {
                setIsMobileOpen(false);
            }
        };

        handleResize(); // Configurar estado inicial
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className='filter-sidebar-container'>
            {/* Botón toggle para móvil */}
            <button 
                className={`filter-mobile-toggle ${isMobileOpen ? 'active' : ''}`}
                onClick={toggleMobileSidebar}
                type="button"
            >
                <i className="bi bi-funnel-fill"></i>
                {isMobileOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                <i className="bi bi-chevron-down"></i>
            </button>

            {/* Sidebar principal */}
            <aside className={`filter-sidebar ${isMobileOpen ? 'is-visible' : ''}`}>
                <div className='filter-sidebar-header'>
                    <h2 className='filter-sidebar-title'>
                        <i className="bi bi-funnel-fill"></i>
                        Filtros
                    </h2>
                </div>

                {/* Sección de Categorías */}
                <div className={`filter-section ${openSections.categories ? 'is-open' : ''}`}>
                    <button 
                        className='filter-section-header'
                        onClick={() => toggleSection('categories')}
                        type="button"
                    >
                        <h3 className='filter-section-title'>Categorías</h3>
                        <i className="bi bi-chevron-down filter-section-toggle"></i>
                    </button>
                    
                    {openSections.categories && (
                        <div className='filter-section-content'>
                            <div className='filter-categories-list'>
                                {categories && categories.length > 0 ? (
                                    categories.map((category) => (
                                        <div key={category.id} className='filter-category-item'>
                                            <label className="filter-checkbox">
                                                <input 
                                                    type="checkbox"
                                                    name={category.id}
                                                    checked={filters.selectedCategoryIds.has(category.id)} 
                                                    onChange={handleCategoryChange}
                                                />
                                                <span className="filter-checkmark"></span>
                                                <span className="filter-category-label">
                                                    {category.description}
                                                </span>
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="filter-no-categories">No hay categorías disponibles</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sección de Rango de Precios */}
                <div className={`filter-section ${openSections.price ? 'is-open' : ''}`}>
                    <button 
                        className='filter-section-header'
                        onClick={() => toggleSection('price')}
                        type="button"
                    >
                        <h3 className='filter-section-title'>Rango de Precios</h3>
                        <i className="bi bi-chevron-down filter-section-toggle"></i>
                    </button>
                    
                    {openSections.price && (
                        <div className='filter-section-content'>
                            <div className='filter-price-container'>
                                <input
                                    type="range"
                                    className="filter-price-slider"
                                    id="price-range-slider"
                                    min="0"
                                    max="70000" 
                                    step="100"
                                    value={filters.priceRange.max}
                                    onChange={handlePriceChange}
                                />
                                
                                <div className="filter-price-labels">
                                    <span className="filter-price-min">$0</span>
                                    <span className="filter-price-max">
                                        Máx: ${filters.priceRange.max.toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default FilterSidebar;