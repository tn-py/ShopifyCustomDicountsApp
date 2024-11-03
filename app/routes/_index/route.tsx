import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { fetchProducts, authenticateAdmin } from "../../shopify.server";
import { useState } from "react";

type Product = {
  id: string;
  title: string;
  sku: string;
  tags: string[];
  collections: string[];
};

type LoaderData = {
  products: Product[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await authenticateAdmin(request);
  const products = await fetchProducts(session);

  return json<LoaderData>({ products });
};

export default function App() {
  const { products } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  
  // UI states
  const [sku, setSku] = useState("");
  const [tags, setTags] = useState("");
  const [collections, setCollections] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Filter products based on search inputs
  const filteredProducts = products.filter(product => {
    const matchesSku = sku ? product.sku.includes(sku) : true;
    const matchesTags = tags
      ? product.tags.some(tag => tag.includes(tags))
      : true;
    const matchesCollections = collections
      ? product.collections.some(collection => collection.includes(collections))
      : true;

    return matchesSku && matchesTags && matchesCollections;
  });

  // Toggle product selection
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Custom Discounts App</h1>
      <p>Select products and apply discounts to them.</p>

      {/* Search Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label>
            SKU:
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Enter SKU"
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>
        </div>
        <div>
          <label>
            Tags:
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags"
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>
        </div>
        <div>
          <label>
            Collection:
            <input
              type="text"
              value={collections}
              onChange={(e) => setCollections(e.target.value)}
              placeholder="Enter collection"
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>
        </div>
      </div>

      {/* Product List */}
      <div>
        <h2>Products</h2>
        {filteredProducts.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {filteredProducts.map((product) => (
              <li
                key={product.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  style={{ marginRight: "1rem" }}
                />
                <div>
                  <strong>{product.title}</strong>
                  <p>SKU: {product.sku}</p>
                  <p>Tags: {product.tags.join(", ")}</p>
                  <p>Collections: {product.collections.join(", ")}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No products found matching your criteria.</p>
        )}
      </div>

      {/* Apply Discount Button */}
      <button
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        disabled={selectedProducts.length === 0}
        onClick={() => alert("Discount functionality to be implemented.")}
      >
        Apply Discount to Selected Products
      </button>
    </div>
  );
}
