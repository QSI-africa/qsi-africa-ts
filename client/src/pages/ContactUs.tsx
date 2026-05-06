import React, { useState } from 'react';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  SendOutlined
} from "@ant-design/icons";
import { AfroButton, GeometricCard, CornerAccent } from "../components/AfroBauhausComponents";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Message received. Our systems are now aligning with your inquiry.");
  };

  const contactInfo = [
    { icon: <EnvironmentOutlined />, title: "Visit Us", content: "No. 3 Jenkinson close, Chisipite, Harare" },
    { icon: <PhoneOutlined />, title: "Call Us", content: "+263 771 099 675", link: "tel:+263771099675" },
    { icon: <MailOutlined />, title: "Email Us", content: "info@qsi.africa", link: "mailto:info@qsi.africa" },
  ];

  return (
    <div style={{ backgroundColor: 'var(--canvas-white)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Header */}
      <section className="section-py pattern-lines" style={{ backgroundColor: 'var(--papyrus-off-white)', borderBottom: '2px solid var(--onyx-black)', paddingTop: '100px' }}>
        <div className="container">
          <span className="eyebrow">Connect</span>
          <h1 style={{ fontSize: '4rem', textTransform: 'uppercase', marginBottom: '24px' }}>
            Let's <span style={{ color: 'var(--baobab-emerald)' }}>Build</span> <br/> Something Great
          </h1>
          <p style={{ maxWidth: '600px', fontSize: '18px', fontWeight: 500 }}>
            Our infrastructure is ready to receive your vision. Reach out to the QSI team for strategic inquiries and collaborations.
          </p>
        </div>
      </section>

      <section className="section-py">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '64px' }}>
            
            {/* Contact Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {contactInfo.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    border: '2px solid var(--onyx-black)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '24px',
                    backgroundColor: 'var(--baobab-emerald)',
                    color: 'var(--canvas-white)'
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '1.25rem', marginBottom: '8px' }}>{item.title}</h3>
                    {item.link ? (
                      <a href={item.link} style={{ color: 'var(--ash-grey)', fontSize: '16px', textDecoration: 'none' }}>{item.content}</a>
                    ) : (
                      <p style={{ color: 'var(--ash-grey)', fontSize: '16px', margin: 0 }}>{item.content}</p>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '32px', padding: '32px', border: '2px solid var(--onyx-black)', position: 'relative' }}>
                <CornerAccent position="tl" color="var(--terracotta-clay)" />
                <h4 style={{ textTransform: 'uppercase', marginBottom: '12px' }}>Operational Hours</h4>
                <p style={{ fontSize: '14px', color: 'var(--ash-grey)' }}>Monday — Friday: 08:00 - 17:00 CAT</p>
                <p style={{ fontSize: '14px', color: 'var(--ash-grey)' }}>Weekend: Emergency Support Only</p>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} style={{ border: '2px solid var(--onyx-black)', padding: '48px', backgroundColor: 'var(--canvas-white)', position: 'relative' }}>
              <h2 style={{ textTransform: 'uppercase', marginBottom: '32px', fontSize: '2rem' }}>Send a Message</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label className="eyebrow" style={{ display: 'block', marginBottom: '8px' }}>Full Name</label>
                  <input 
                    name="name"
                    required
                    style={{ width: '100%', padding: '16px', border: '2px solid var(--onyx-black)', fontFamily: 'var(--font-accent)', outline: 'none' }}
                    placeholder="ENTER YOUR NAME"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="eyebrow" style={{ display: 'block', marginBottom: '8px' }}>Email Address</label>
                  <input 
                    name="email"
                    type="email"
                    required
                    style={{ width: '100%', padding: '16px', border: '2px solid var(--onyx-black)', fontFamily: 'var(--font-accent)', outline: 'none' }}
                    placeholder="EMAIL@QSI.AFRICA"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="eyebrow" style={{ display: 'block', marginBottom: '8px' }}>Inquiry Message</label>
                  <textarea 
                    name="message"
                    required
                    rows={6}
                    style={{ width: '100%', padding: '16px', border: '2px solid var(--onyx-black)', fontFamily: 'var(--font-accent)', outline: 'none', resize: 'none' }}
                    placeholder="HOW CAN WE ALIGN?"
                    onChange={handleChange}
                  />
                </div>
                <AfroButton primary type="submit" style={{ width: '100%', height: '60px' }}>
                  Transmit Message <SendOutlined />
                </AfroButton>
              </div>
            </form>

          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
