import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const API_KEY =
  "822b6c601ec5f570caac1fd9d6a434c1e436be01eb7a3e3030a62b5d624e0a9c";

function App() {
  const [order, setOrder] = useState({
    customerId: "",
    items: [{ productId: "", quantity: 1, price: 0 }],
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          apikey: API_KEY,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data || []); // ← ADD "|| []" HERE
      } else {
        setOrders([]); // ← ADD THIS
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]); // ← ADD THIS
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          apikey: API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: `Order created: ${data.orderId}` });
        setOrder({
          customerId: "",
          items: [{ productId: "", quantity: 1, price: 0 }],
        });
        fetchOrders();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to create order",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...order.items];
    newItems[index][field] =
      field === "quantity" || field === "price"
        ? parseFloat(value) || 0
        : value;
    setOrder({ ...order, items: newItems });
  };

  return (
    <div className="App">
      <header>
        <h1>Order Processing System</h1>
        <p>Microservices Architecture</p>
      </header>

      <div className="container">
        <div className="form-section">
          <h2>Create Order</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Customer ID</label>
              <input
                type="text"
                value={order.customerId}
                onChange={(e) =>
                  setOrder({ ...order, customerId: e.target.value })
                }
                placeholder="CUST-001"
                required
              />
            </div>

            {order.items.map((item, index) => (
              <div key={index} className="item-group">
                <div className="form-group">
                  <label>Product ID</label>
                  <input
                    type="text"
                    value={item.productId}
                    onChange={(e) =>
                      updateItem(index, "productId", e.target.value)
                    }
                    placeholder="PROD-123"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, "price", e.target.value)
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Submit Order"}
            </button>
          </form>

          {message && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
        </div>

        <div className="orders-section">
          <h2>Recent Orders</h2>
          <div className="orders-list">
            {!orders || orders.length === 0 ? (
              <p className="no-orders">No orders yet</p>
            ) : (
              orders.map((ord) => (
                <div key={ord.id || ord.orderId} className="order-card">
                  <div className="order-header">
                    <strong>{ord.orderId}</strong>
                    <span className={`status ${ord.status}`}>{ord.status}</span>
                  </div>
                  <p>Customer: {ord.customerId}</p>
                  <p>Items: {ord.items?.length || 0}</p>
                  <p className="order-date">
                    {new Date(ord.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
