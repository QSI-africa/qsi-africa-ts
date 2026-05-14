import React, { useState  } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  App as AntApp,
  Steps,
  Grid,
  Spin
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { 
  Zap, 
  User, 
  Globe, 
  Activity, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const steps = [
  { title: "Initialize", content: "Welcome" },
  { title: "Identity", content: "Background & Beliefs" },
  { title: "Vision", content: "Goals & Challenges" },
];

const OnboardingPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [current, setCurrent] = useState<number>(0);
  const [form] = Form.useForm();
  const { user, token, refetchUser } = useAuth();
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const screens = useBreakpoint();

  const handleNext = async () => {
    try {
      if (current === 1) {
        await form.validateFields(["location", "personalBeliefs", "background"]);
      } else if (current === 2) {
        await form.validateFields(["lifeVision", "challenges"]);
      }
      setCurrent(current + 1);
    } catch (err) {
      console.log("Validation failed:", err);
    }
  };

  const handlePrev = () => {
    setCurrent(current - 1);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    const profileData = {
      fullName: user?.name || "User",
      location: values.location,
      personalBeliefs: values.personalBeliefs,
      background: values.background,
      lifeVision: values.lifeVision,
      challenges: values.challenges,
    };

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.post("/onboarding/profile", profileData);
      message.success("Profile synchronized! AI analysis is underway.");
      if (refetchUser) await refetchUser();
      navigate("/");
    } catch (err: any) {
      message.error(err.response?.data?.error || "Failed to create profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-bg-primary p-6 lg:p-12 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none -z-0">
         <Zap size={800} className="text-accent-gold" />
      </div>

      <div className="w-full max-w-2xl bg-bg-secondary border border-border-subtle rounded-3xl p-8 lg:p-12 shadow-2xl relative z-10">
        <div className="text-center mb-10">
           <span className="eyebrow">Frequency Calibration</span>
           <h1 className="text-3xl lg:text-4xl font-black text-white mt-2 mb-4 uppercase tracking-tight">Initialize Profile</h1>
           <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
             Let's create your Frequency Profile. This helps us synchronize your vision with the platform's intelligent infrastructure.
           </p>
        </div>

        <Steps
          current={current}
          className="custom-steps mb-12"
          items={steps.map((s) => ({
            title: screens.md ? s.title : "",
            icon: current > steps.indexOf(s) ? <CheckCircle2 size={16} /> : undefined
          }))}
        />

        <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-6">
          {/* Step 0: Welcome */}
          {current === 0 && (
            <div className="py-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-bg-primary border border-border-subtle flex items-center justify-center text-accent-gold mx-auto mb-8 shadow-xl">
                 <Activity size={32} />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4">The Frequency Scan</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                To provide you with coherent guidance, QSI first understands your unique energetic signature. This involves mapping your worldview, vision, and current challenges.
              </p>
              <div className="inline-block px-4 py-2 bg-bg-primary rounded-full border border-border-subtle">
                 <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Est. Time: 2-3 Minutes</span>
              </div>
            </div>
          )}

          {/* Step 1: Background & Beliefs */}
          {current === 1 && (
            <div className="space-y-6 animate-fade-in">
              <Form.Item name="location" label={<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Current Location</span>} rules={[{ required: true }]}>
                <Input className="bg-bg-primary border-border-subtle text-white h-12 rounded-xl" placeholder="e.g. Harare, Zimbabwe" />
              </Form.Item>
              <Form.Item name="personalBeliefs" label={<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Worldview & Philosophy</span>} rules={[{ required: true }]}>
                <TextArea rows={4} className="bg-bg-primary border-border-subtle text-white rounded-xl resize-none" placeholder="What are your core beliefs about the world or your place in it?" />
              </Form.Item>
              <Form.Item name="background" label={<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Technical Background</span>} rules={[{ required: true }]}>
                <TextArea rows={4} className="bg-bg-primary border-border-subtle text-white rounded-xl resize-none" placeholder="Describe your educational and professional trajectory." />
              </Form.Item>
            </div>
          )}

          {/* Step 2: Vision & Challenges */}
          {current === 2 && (
            <div className="space-y-6 animate-fade-in">
              <Form.Item name="lifeVision" label={<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Strategic Vision</span>} rules={[{ required: true }]}>
                <TextArea rows={4} className="bg-bg-primary border-border-subtle text-white rounded-xl resize-none" placeholder="What do you want to create or achieve in this cycle?" />
              </Form.Item>
              <Form.Item name="challenges" label={<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Operational Obstacles</span>} rules={[{ required: true }]}>
                <TextArea rows={4} className="bg-bg-primary border-border-subtle text-white rounded-xl resize-none" placeholder="What are your primary friction points right now?" />
              </Form.Item>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-8">
            {current > 0 ? (
              <button onClick={handlePrev} className="qsi-button flex-1 py-4 font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Previous
              </button>
            ) : (
              <div className="flex-1 hidden md:block" />
            )}

            {current < steps.length - 1 ? (
              <button onClick={handleNext} className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2">
                Next Step <ArrowRight size={18} />
              </button>
            ) : (
              <button onClick={() => form.submit()} disabled={loading} className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2 shadow-xl shadow-accent-gold/20">
                {loading ? 'SYNCHRONIZING...' : 'FINALIZE PROFILE'} <Zap size={18} />
              </button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default OnboardingPage;
