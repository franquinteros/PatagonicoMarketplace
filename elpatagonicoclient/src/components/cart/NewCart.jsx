import CartItem from "./CartItem";
import { useNavigate } from "react-router-dom";


const NewCart = ({ items, totalAmount, onIncrementQuantity, onDecrementQuantity, onItemRemove }) => {

  const navigate = useNavigate();
  
  return (
    <div className="row">
      {/* Lista de items del carrito */}
      <div className="col-lg-8">
        <div className="cart-header mb-4">
          <h2 className="cart-title">
            <i className="bi bi-cart3 me-2"></i>
            Mi Carrito
          </h2>
          <span className="cart-badge">
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </span>
        </div>

        <div className="cart-items-list">
          {items.map((item) => (
            <CartItem
              key={item.id}
              cartItem={item}
              onIncrement={onIncrementQuantity}
              onDecrement={onDecrementQuantity}
              onRemove={onItemRemove}
            />
          ))}
        </div>
      </div>

      {/* Resumen del carrito */}
      <div className="col-lg-4 mt-4 mt-lg-0">
        <div className="cart-summary">
          <h4 className="cart-summary-title">Resumen del pedido</h4>

          <div className="cart-summary-row">
            <span>Subtotal:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          <div className="cart-summary-row">
            <span>Envío:</span>
            <span className="text-success">Gratis</span>
          </div>

          <hr className="cart-divider" />

          <div className="cart-summary-total">
            <strong>Total:</strong>
            <strong className="cart-total-amount">
              ${totalAmount.toFixed(2)}
            </strong>
          </div>

          <button className="btn btn-cart-primary w-100 mb-3"
          onClick={() =>{
            navigate("/checkout")
          }
          }>
            <i className="bi bi-credit-card me-2"></i>
            Proceder al pago
          </button>

          <a href="/products" className="btn btn-cart-secondary w-100">
            <i className="bi bi-arrow-left me-2"></i>
            Seguir comprando
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewCart;