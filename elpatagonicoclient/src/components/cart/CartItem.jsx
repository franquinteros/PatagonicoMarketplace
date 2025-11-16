import { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosConfig";

const CartItem = ({ cartItem, onIncrement, onDecrement, onRemove }) => {
  const { id, productName, unitPrice, quantity, finalPrice, image } = cartItem;

  const [imageData, setImageData] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (!image) {
        //console.log(`[CartItem] No image for product ${id}`);
        setImageData(null);
        setImageLoading(false);
        return;
      }
      try {
        //console.log(`[CartItem] Fetching image: ${image}`);

        const response = await axiosInstance.get(image, { responseType: 'json' });
        
        if (response.data.file) {
          const dataUrl = `data:image/png;base64,${response.data.file}`;
          setImageData(dataUrl);
        }
      } catch (error) {
        //console.error(`[CartItem] Error fetching image:`, error);
        setImageData(null);
      } finally {
        setImageLoading(false);
      }
    };

    fetchImage();
  }, [image, id]);

  const placeholderUrl = `https://placehold.co/100x100/e0f2f1/004d40?text=${encodeURIComponent(productName || "Producto")}`;
  const displayImage = imageData || placeholderUrl;

  return (
    <div className="cart-item-card mb-3">
      <div className="row g-0 align-items-center">
        {/* Imagen del producto */}
        <div className="col-md-2 col-3">
          <div className="cart-item-image-wrapper">
            {imageLoading ? (
              <div className="cart-item-image-placeholder">
                <span>Cargando...</span>
              </div>
            ) : (
              <img
                src={displayImage || "/placeholder.svg"}
                alt={productName}
                className="cart-item-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = placeholderUrl;
                }}
              />
            )}
          </div>
        </div>

        {/* Nombre y precio */}
        <div className="col-md-4 col-9">
          <h5 className="cart-item-name">{productName}</h5>
          <p className="cart-item-price">
            <span className="text-muted">Precio unitario: </span>
            {/* ✅ SIN DIVIDIR POR 100 */}
            <strong>${unitPrice.toFixed(2)}</strong>
          </p>
        </div>

        {/* Controles de cantidad */}
        <div className="col-md-3 col-6">
          <div className="cart-quantity-controls">
            <button
              className="btn-quantity"
              onClick={() => onDecrement(id)}
              disabled={quantity <= 1}
            >
              <i className="bi bi-dash"></i>
            </button>
            <span className="quantity-display">{quantity}</span>
            <button
              className="btn-quantity"
              onClick={() => onIncrement(id)}
              disabled={quantity >= 10}
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
        </div>

        {/* Precio total y botón eliminar */}
        <div className="col-md-2 col-4 text-end">
          {/* ✅ SIN DIVIDIR POR 100 */}
          <div className="cart-item-total">${finalPrice.toFixed(2)}</div>
        </div>

        <div className="col-md-1 col-2 text-end">
          {onRemove && (
            <button className="btn-remove" onClick={() => onRemove(id)} aria-label="Eliminar producto">
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
