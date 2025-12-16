import React, { useState  } from 'react';
// Assuming you have a component library for Modal/Button (e.g., MUI, Chakra)
// Or you can replace these with simple <div> and <button> elements.

const InvoiceGeneratorModal = ({ referenceId, referenceType, onClose }) => {
  // --- State Management ---
  const [client, setClient] = useState({ name: "", email: "", address: "" });
  const [invoiceType, setInvoiceType] = useState<string>("QUOTATION");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Line items structure: id, description, quantity, unitPrice
  const [items, setItems] = useState([
    { id: 1, description: "", quantity: 1, unitPrice: 0 },
  ]);

  // --- Dynamic Calculation ---
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  // --- Handlers ---
  const handleItemChange = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      { id: Date.now(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Prepare Payload
    const payload = {
      client: client,
      items: items.map((item) => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
      })),
      type: invoiceType,
      referenceId: referenceId, // Linked from the parent component (e.g., Project ID)
      referenceType: referenceType, // e.g., 'INFRASTRUCTURE' or 'HEALING'
      notes: notes,
      // dueDate is optional, or calculate it here
    };

    // 2. API Call to the secured backend
    try {
      const API_BASE_URL = "https://api.qsi.africa"; // Secured API endpoint

      const response = await fetch(`${API_BASE_URL}/api/invoicing/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include Authorization header if protected route
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to generate invoice.");
      }

      alert(`✅ ${invoiceType} successfully sent!`);
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Submission Error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Structure (Simplified JSX) ---
  return (
    <div className="modal-overlay">
      <form onSubmit={handleSubmit} className="invoice-modal">
        <h2>Generate {invoiceType}</h2>
        <hr />

        {/* Client & Type Selection */}
        <div className="client-fields">
          <select
            value={invoiceType}
            onChange={(e) => setInvoiceType(e.target.value)}
          >
            <option value="QUOTATION">Quotation (QTE)</option>
            <option value="INVOICE">Invoice (INV)</option>
          </select>
          <input
            type="email"
            placeholder="Client Email"
            required
            value={client.email}
            onChange={(e) => setClient({ ...client, email: e.target.value })}
          />
          {/* Add Client Name/Address inputs here */}
        </div>

        {/* Line Items Table */}
        <div className="line-items">
          <h3>Line Items</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "quantity",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "unitPrice",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td>{(item.quantity * item.unitPrice).toFixed(2)}</td>
                  <td>
                    <button type="button" onClick={() => removeItem(item.id)}>
                      —
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addItem}>
            + Add Item
          </button>
        </div>

        {/* Total and Footer */}
        <div className="summary">
          <strong>Total Due: USD {calculateTotal().toFixed(2)}</strong>
          <textarea
            placeholder="Notes (Payment terms, etc.)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <div className="actions">
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || calculateTotal() === 0}
          >
            {isSubmitting ? "Sending..." : `Send ${invoiceType} & Email`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceGeneratorModal;
