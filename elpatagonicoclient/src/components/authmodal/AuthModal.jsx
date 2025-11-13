import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ onClose }) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
        if (onClose) onClose();
    };

    const handleRegister = () => {
        navigate('/register');
        if (onClose) onClose();
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(139, 69, 19, 0.4)' }}
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="modal-content border-0 position-relative"
                    style={{
                        borderRadius: '24px',
                        boxShadow: '0 20px 60px rgba(139, 69, 19, 0.3)',
                        animation: 'slideUp 0.4s ease-out',
                        overflow: 'hidden'
                    }}
                >
                    {/* Botón cerrar */}
                    <button
                        type="button"
                        className="btn-close position-absolute"
                        aria-label="Close"
                        onClick={onClose}
                        style={{
                            top: '20px',
                            right: '20px',
                            zIndex: 10,
                            filter: 'brightness(0.8)'
                        }}
                    />

                    {/* Header con gradiente */}
                    <div
                        className="modal-header border-0 pb-0"
                        style={{
                            background: 'linear-gradient(135deg, #8B4513, #A0522D)',
                            padding: '2.5rem 2rem 1.5rem'
                        }}
                    >
                        <div className="w-100 text-center">
                            <div
                                className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    animation: 'pulse 2s ease-in-out infinite'
                                }}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    width="35"
                                    height="35"
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </div>
                            <h5 className="modal-title text-white fw-bold mb-0" style={{ fontSize: '1.5rem' }}>
                                Acceso Requerido
                            </h5>
                        </div>
                    </div>

                    {/* Body */}
                    <div
                        className="modal-body text-center"
                        style={{
                            padding: '2.5rem 2rem',
                            background: 'linear-gradient(135deg, #FAF9F6 0%, #FFFAF3 100%)'
                        }}
                    >
                        <p className="fw-semibold mb-2" style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>
                            Para ver tus productos favoritos
                        </p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                            Necesitas iniciar sesión o crear una cuenta
                        </p>
                        <p className="mb-0 mt-2" style={{ fontSize: '0.9rem', color: '#A0522D', fontWeight: '500' }}>
                            ¡Te toma solo unos segundos!
                        </p>
                    </div>

                    {/* Footer con botones */}
                    <div
                        className="modal-footer border-0 justify-content-center gap-3"
                        style={{
                            padding: '1.5rem 2rem 2.5rem',
                            background: 'linear-gradient(135deg, #FAF9F6 0%, #FFFAF3 100%)'
                        }}
                    >
                        <button
                            type="button"
                            className="btn fw-bold d-flex align-items-center gap-2"
                            onClick={handleRegister}
                            style={{
                                padding: '12px 28px',
                                background: 'white',
                                color: '#8B4513',
                                border: '2px solid #8B4513',
                                borderRadius: '12px',
                                fontSize: '15px',
                                transition: 'all 0.3s ease',
                                minWidth: '150px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#8B4513';
                                e.target.style.color = 'white';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(139, 69, 19, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.color = '#8B4513';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="8.5" cy="7" r="4"/>
                                <line x1="20" y1="8" x2="20" y2="14"/>
                                <line x1="23" y1="11" x2="17" y2="11"/>
                            </svg>
                            <span>Registrarme</span>
                        </button>

                        <button
                            type="button"
                            className="btn fw-bold d-flex align-items-center gap-2"
                            onClick={handleLogin}
                            style={{
                                padding: '12px 28px',
                                background: 'linear-gradient(135deg, #DAA520 0%, #F4C430 100%)',
                                color: '#1a1a1a',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '15px',
                                boxShadow: '0 4px 16px rgba(218, 165, 32, 0.3)',
                                transition: 'all 0.3s ease',
                                minWidth: '150px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #F4C430 0%, #DAA520 100%)';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(218, 165, 32, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #DAA520 0%, #F4C430 100%)';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 16px rgba(218, 165, 32, 0.3)';
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                <polyline points="10 17 15 12 10 7"/>
                                <line x1="15" y1="12" x2="3" y2="12"/>
                            </svg>
                            <span>Iniciar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }
            `}</style>
        </div>
    );
};

export default AuthModal;
