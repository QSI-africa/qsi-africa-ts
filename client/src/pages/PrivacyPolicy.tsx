// src/pages/PrivacyPolicy.jsx
import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "800px", 
      margin: "0 auto",
      minHeight: "100vh"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Privacy Policy
      </h1>
      
      <div style={{ background: "white", padding: "30px", borderRadius: "8px" }}>
        <h2>1. Information We Collect</h2>
        <p>We collect personal and technical information to provide our services.</p>
        
        <h2>2. Data Security</h2>
        <p>Your data is protected with encryption and secure servers.</p>
        
        <h2>3. Your Rights</h2>
        <p>You have the right to access, correct, or delete your data.</p>
        
        <h2>Contact Information</h2>
        <p>
          <strong>PAN AFRICAN ENGINEERS</strong><br />
          No. 3 Jenkingson Close, Chisipite, Harare<br />
          +263 771 099 675 / +263 719 999 675<br />
          info@qsi.co.zw
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;