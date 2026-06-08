import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Row,
  Col,
  Avatar,
  Tag,
  Space,
  Button,
  Skeleton,
  Empty,
  Image,
  Spin,
} from "antd";
import {
  ShieldCheck,
  ArrowLeft,
  Globe,
  Layers,
  Zap,
  BookOpen,
  Calendar,
  Activity,
  MoreVertical,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import api from "../api";

const { Title, Text, Paragraph } = Typography;

const ProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/network/profile/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getServerUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const apiBase = api.defaults.baseURL || "";
    const rootUrl = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
    return `${rootUrl}${path}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-6 tracking-tight">
          Profile Not Found
        </h2>
        <button
          className="qsi-button primary px-8 py-3"
          onClick={() => navigate("/network")}
        >
          Back to Network
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      {/* Hero Section */}
      <header className="px-6 py-5 bg-bg-secondary relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 flex justify-between items-center">
          <button
            onClick={() => navigate("/network")}
            className="qsi-button flex items-center gap-1.5 mb-4 py-1.5 px-3 h-10 text-sm rounded-md"
          >
            <ArrowLeft size={14} /> Back to Network
          </button>

          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <div className="relative group shrink-0">
              {profile.isVerified && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-success-green rounded-full flex items-center justify-center text-white border-2 border-bg-secondary z-20 shadow-md">
                  <ShieldCheck size={14} />
                </div>
              )}
              <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full opacity-20 -z-10 group-hover:opacity-40 transition-opacity" />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                  {profile.user.name}
                </h1>
                <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider">
                  {profile.isVerified
                    ? "• Sovereign Mind (Verified)"
                    : "• Professional Member"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center mb-2">
                <span className="text-sm font-semibold text-success-green">
                  {profile.specialization}
                </span>
                <div className="hidden md:block w-px h-3.5 bg-border-subtle" />
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Globe size={14} />
                  <span className="text-xs font-medium tracking-wide">
                    Pan-African Ecosystem
                  </span>
                </div>
              </div>

              <p className="text-sm text-text-secondary max-w-3xl leading-snug italic">
                "
                {profile.bio ||
                  "Dedicated to building the foundations of a sovereign and prosperous African future through excellence in infrastructure and thought leadership."}
                "
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="max-w-6xl mx-auto w-full p-8 lg:p-12">
        <Row gutter={[48, 48]}>
          <Col xs={24} lg={16}>
            <div className="space-y-16">
              {/* Projects */}
              <div>
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <span className="eyebrow">Practical Contribution</span>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      Project Ledger
                    </h2>
                  </div>
                  <Activity
                    size={32}
                    className="text-accent-primary opacity-10"
                  />
                </div>

                <div className="space-y-8">
                  {profile.projects && profile.projects.length > 0 ? (
                    profile.projects.map((proj: any) => (
                      <div
                        key={proj.id}
                        className="feed-card bg-bg-secondary border-border-subtle overflow-hidden p-0 group"
                      >
                        <div className="h-64 border-b border-border-subtle relative overflow-hidden">
                          <img
                            src={getServerUrl(proj.imageUrl)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={proj.title}
                          />
                          <div className="absolute top-6 right-6">
                            <Tag className="rounded-full px-4 py-1 bg-bg-primary/80 backdrop-blur-md border-border-subtle text-accent-primary font-black  text-[9px]">
                              {proj.status}
                            </Tag>
                          </div>
                        </div>
                        <div className="p-8 lg:p-12">
                          <h3 className="text-2xl font-bold text-white  tracking-tight mb-4">
                            {proj.title}
                          </h3>
                          <p className="text-text-secondary leading-relaxed mb-8">
                            {proj.description}
                          </p>
                          <div className="flex items-center justify-between pt-6 border-t border-border-subtle/50">
                            <div className="flex items-center gap-2 text-text-tertiary">
                              <Layers size={16} />
                              <span className="text-[10px] font-bold  tracking-widest">
                                Outcome Verified
                              </span>
                            </div>
                            <button className="qsi-button text-xs font-black  tracking-widest text-accent-primary hover:underline flex items-center gap-2">
                              View Case Study <ExternalLink size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 border-2 border-dashed border-border-subtle rounded-3xl text-center">
                      <Layers
                        size={48}
                        className="mx-auto text-text-tertiary opacity-20 mb-4"
                      />
                      <p className="text-text-tertiary font-bold  tracking-widest">
                        No Projects Logged Yet
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Insights */}
              <div>
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <span className="eyebrow">Intellectual Leadership</span>
                    <h2 className="text-3xl font-black text-white  tracking-tight">
                      Sovereign Insights
                    </h2>
                  </div>
                  <BookOpen
                    size={32}
                    className="text-accent-primary opacity-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.insights && profile.insights.length > 0 ? (
                    profile.insights.map((insight: any) => (
                      <div
                        key={insight.id}
                        onClick={() => navigate(`/insights/${insight.id}`)}
                        className="feed-card bg-bg-secondary border-border-subtle p-8 hover:border-accent-primary/40 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[9px] font-black text-text-tertiary  tracking-widest bg-bg-primary px-3 py-1 rounded-full border border-border-subtle">
                              {insight.category || "INSIGHT"}
                            </span>
                            <span className="text-[9px] font-bold text-text-tertiary ">
                              {formatDate(insight.createdAt)}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-white  tracking-tight mb-4 group-hover:text-accent-primary transition-colors">
                            {insight.title}
                          </h4>
                          <p className="text-text-secondary leading-relaxed mb-6 text-xs line-clamp-4">
                            {insight.content}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Zap
                            size={18}
                            className="text-accent-primary opacity-20 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-20 border-2 border-dashed border-border-subtle rounded-3xl text-center w-full">
                      <BookOpen
                        size={48}
                        className="mx-auto text-text-tertiary opacity-20 mb-4"
                      />
                      <p className="text-text-tertiary font-bold  tracking-widest">
                        No Sovereign Insights Logged Yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <div className="sticky top-12 space-y-8">
              <div className="feed-card bg-bg-secondary border-border-subtle p-8 text-center relative overflow-hidden">
                <Activity
                  size={100}
                  className="absolute -bottom-8 -right-8 opacity-5 text-accent-primary"
                />
                <h3 className="text-xl font-bold text-white tracking-tight mb-6">
                  Engage Professional
                </h3>
                <button className="qsi-button primary w-full py-5 font-black text-xs tracking-widest mb-4 shadow-xl shadow-accent-primary/10">
                  Schedule Consultation
                </button>
                <button className="qsi-button w-full py-5 font-black text-xs tracking-widest flex items-center justify-center gap-2">
                  <MessageCircle size={16} /> Secure Message
                </button>
              </div>

              <div className="feed-card bg-bg-secondary border-border-subtle p-8">
                <h4 className="text-[10px] font-black text-text-tertiary tracking-widest mb-6">
                  Operational Network
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      Network ID
                    </span>
                    <span className="text-xs font-mono text-white">
                      QSI-MIN-{profile.id.slice(-4).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">Status</span>
                    <span className="text-xs font-black text-success-green uppercase">
                      Synchronized
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      Resonance
                    </span>
                    <span className="text-xs font-bold text-white">
                      {(
                        95 +
                        (profile.user.name.length % 5) +
                        (profile.bio ? profile.bio.length % 10 : 0) / 10
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </section>
    </div>
  );
};

export default ProfileDetailPage;
