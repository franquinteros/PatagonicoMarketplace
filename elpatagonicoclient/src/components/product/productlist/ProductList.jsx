import ProductCard from "../productcard/ProductCard"
import "./ProductList.css"

const ProductList = ({ products }) => {
  if (!products || products.length === 0) {
    return <p>No se encontraron productos</p>
  }

  return (
    <div className="product-list-container">
      {products.map((product) => {
        let imageId = null
        if (product.imagesURL && product.imagesURL.length > 0) {
          // Extract the id parameter from the URL string like "/api/images?id=123"
          const urlParams = new URLSearchParams(product.imagesURL[0].split("?")[1])
          imageId = urlParams.get("id")
        }

        return (
          <ProductCard
  key={product.id}
  id={product.id}
  name={product.name}
  description={product.description}
  basePrice={product.basePrice}
  price={product.price}
  imagesURL={product.imagesURL}
/>
        )
      })}
    </div>
  )
}

export default ProductList
