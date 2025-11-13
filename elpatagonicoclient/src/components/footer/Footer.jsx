import logo from '../../assets/logo.jpeg';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-3">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex al   ign-items-center mb-3">
              <img
                src = {logo}
                alt="Mates El Patagónico"
                height="60"
                className="me-3"
                style={{ borderRadius: '50%' }}
              />
              <h4 className="mb-0 text-accent-custom">Mates El Patagónico</h4>
            </div>
            <p className="text-light mb-3">
              Tradición patagónica en cada mate. Productos artesanales de la más alta calidad
              para los verdaderos amantes del mate.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-white fs-4 hover-accent">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white fs-4 hover-accent">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-white fs-4 hover-accent">
                <i className="bi bi-whatsapp"></i>
              </a>
              <a href="#" className="text-white fs-4 hover-accent">
                <i className="bi bi-twitter"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="text-accent-custom mb-3 fw-bold">Navegación</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#home" className="text-light text-decoration-none hover-accent">
                  <i className="bi bi-chevron-right me-1"></i>Inicio
                </a>
              </li>
              <li className="mb-2">
                <a href="#productos" className="text-light text-decoration-none hover-accent">
                  <i className="bi bi-chevron-right me-1"></i>Productos
                </a>
              </li>
              <li className="mb-2">
                <a href="#nosotros" className="text-light text-decoration-none hover-accent">
                  <i className="bi bi-chevron-right me-1"></i>Nosotros
                </a>
              </li>
              <li className="mb-2">
                <a href="#contacto" className="text-light text-decoration-none hover-accent">
                  <i className="bi bi-chevron-right me-1"></i>Contacto
                </a>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h5 className="text-accent-custom mb-3 fw-bold">Categorías</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none hover-accent">
                  <i className="bi bi-chevron-right me-1"></i>Mates Premium
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none hover-accent">
                  <i className="bi bi-chevron-right me-1"></i>Bombillas
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none hover-accent">
                  <i className="bi bi-chevron-right me-1"></i>Yerbas
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none hover-accent">
                  <i className="bi bi-chevron-right me-1"></i>Accesorios
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none hover-accent">
                  <i className="bi bi-chevron-right me-1"></i>Sets Completos
                </a>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h5 className="text-accent-custom mb-3 fw-bold">Contacto</h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-geo-alt-fill text-accent-custom me-2 mt-1"></i>
                <span className="text-light">Patagonia, Argentina</span>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-envelope-fill text-accent-custom me-2 mt-1"></i>
                <a href="mailto:info@mateselpatagonico.com" className="text-light text-decoration-none hover-accent">
                  info@mateselpatagonico.com
                </a>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-phone-fill text-accent-custom me-2 mt-1"></i>
                <a href="tel:+542901234567" className="text-light text-decoration-none hover-accent">
                  +54 290 123-4567
                </a>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-clock-fill text-accent-custom me-2 mt-1"></i>
                <span className="text-light">Lun - Sáb: 9:00 - 20:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="row pt-4 border-top border-secondary">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="text-light mb-0">
              &copy; {new Date().getFullYear()} Mates El Patagónico. Todos los derechos reservados.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <a href="#" className="text-light text-decoration-none me-3 hover-accent">Términos y Condiciones</a>
            <a href="#" className="text-light text-decoration-none me-3 hover-accent">Política de Privacidad</a>
            <a href="#" className="text-light text-decoration-none hover-accent">Cambios y Devoluciones</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;