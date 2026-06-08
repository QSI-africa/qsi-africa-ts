import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  ArrowRight,
  Compass,
  FlaskConical,
  Users,
  Globe,
} from "lucide-react";

const GREEN = "#10B981";

const AccountRequiredPage: React.FC = () => {
  const navigate = useNavigate();

  const publicRoutesList = [
    {
      title: "PanX Lab",
      desc: "Browse dynamic syllabus modules, watch masterclasses, and explore teacher channels.",
      path: "/lab",
      icon: <FlaskConical size={20} color={GREEN} />,
    },
    {
      title: "PanX Feed",
      desc: "See public threads, tech concepts, and community updates from our network of builders.",
      path: "/ecosystem",
      icon: <Compass size={20} color="#3B82F6" />,
    },
    {
      title: "Sovereign Minds",
      desc: "Explore the decentralized network and collaborative nodes driving African technology.",
      path: "/network",
      icon: <Users size={20} color="#8B5CF6" />,
    },
    {
      title: "Smart City Demos",
      desc: "Interact with simulated urban infrastructure showcases and technology pilots.",
      path: "/demos",
      icon: <Globe size={20} color="#F59E0B" />,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: "40px 24px",
        color: "white",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          width: "100%",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "28px",
          padding: "48px 40px",
          backdropFilter: "blur(24px)",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        {/* Shield Icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: GREEN,
            margin: "0 auto 24px auto",
            boxShadow: "0 0 20px rgba(16,185,129,0.15)",
          }}
        >
          <Lock size={32} />
        </div>

        {/* Heading */}
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 900,
            letterSpacing: "-0.025em",
            margin: "0 0 12px 0",
            background:
              "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Unlock Member Access
        </h2>
        <p
          style={{
            fontSize: "14.5px",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.6,
            maxWidth: "460px",
            margin: "0 auto 32px auto",
          }}
        >
          This section is reserved for registered QSI members. Create a free
          account or log in to manage your profile, view requests, and access
          billing services.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            marginBottom: "40px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/login")}
            style={{
              background: GREEN,
              border: "none",
              color: "black",
              padding: "14px 28px",
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "13.5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
            }}
          >
            Sign In <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "white",
              padding: "14px 28px",
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "13.5px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Create Account
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            margin: "0 0 32px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.06)",
            }}
          ></div>
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            Or Explore Public Sections
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.06)",
            }}
          ></div>
        </div>

        {/* Public Routes Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            textAlign: "left",
          }}
        >
          {publicRoutesList.map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate(item.path)}
              style={{
                padding: "20px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(255,255,255,0.03)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.03)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                {item.icon}
                <span
                  style={{ fontWeight: 800, fontSize: "13px", color: "white" }}
                >
                  {item.title}
                </span>
              </div>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountRequiredPage;
