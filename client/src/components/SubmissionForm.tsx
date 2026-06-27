import React, { useState  } from 'react';
import axios from "axios";
import {
  Form,
  Input,
  Select,
  Spin,
  App as AntApp,
  Alert,
  Typography
} from "antd";
import { 
  Zap, 
  Send, 
  Layers, 
  Heart, 
  Activity,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const SubmissionForm: React.FC = () => {
  const { message } = AntApp.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModule, setSelectedModule] = useState<string>("infrastructure");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [form] = Form.useForm();

  const handleModuleChange = (value: string) => {
    setSelectedModule(value);
    setApiResponse(null);
    form.resetFields(["description", "contactInfo"]);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    setApiResponse(null);
    const endpointMap: Record<string, string> = {
      infrastructure: "/infrastructure",
      healing: "/healing",
      vision: "/vision",
    };

    const payloadMap: Record<string, any> = {
      infrastructure: {
        description: values.description,
        contactInfo: values.contactInfo,
      },
      healing: {
        struggleDescription: values.description,
        contactInfo: values.contactInfo,
      },
      vision: {
        visionDescription: values.description,
        contactInfo: values.contactInfo,
      },
    };

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      const endpoint = `${baseURL}/submit${endpointMap[selectedModule]}`;
      const response = await axios.post(endpoint, payloadMap[selectedModule]);

      message.success("Operational brief synchronized successfully.");
      setApiResponse(response.data);
      form.resetFields();
    } catch (error) {
      console.error("Submission failed:", error);
      message.error(error?.response?.data?.error || error?.response?.data?.message || "Frequency synchronization failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFormLabel = () => {
    switch (selectedModule) {
      case "healing":
        return "Describe your current mental or energetic friction...";
      case "vision":
        return "Describe your strategic vision or bottleneck...";
      case "infrastructure":
      default:
        return "Describe your structural requirement (Water, Energy, Mobility)...";
    }
  };

  const getModuleIcon = () => {
    switch (selectedModule) {
      case "healing":
        return <Heart size={20} className="text-red-500" />;
      case "vision":
        return <Zap size={20} className="text-accent-primary" />;
      default:
        return <Layers size={20} className="text-success-green" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="feed-card bg-bg-secondary border-border-subtle p-8 lg:p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-accent-primary group-hover:scale-110 transition-transform duration-700">
           <Send size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 rounded-2xl bg-bg-primary border border-border-subtle flex items-center justify-center text-accent-primary shadow-xl">
                <Activity size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Technical Briefing</h2>
                <p className="text-xs text-text-tertiary uppercase tracking-widest font-bold">Submit problem. Receive solution.</p>
             </div>
          </div>

          <Spin spinning={loading}>
            <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-6">
              <Form.Item
                label={<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Operational Module</span>}
              >
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                     {getModuleIcon()}
                  </div>
                  <Select
                    defaultValue="infrastructure"
                    onChange={handleModuleChange}
                    className="custom-select pl-10 h-12 w-full"
                  >
                    <Option value="infrastructure">Smart Infrastructure</Option>
                    <Option value="healing">Healing & Wisdom</Option>
                    <Option value="vision">Vision Space</Option>
                  </Select>
                </div>
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">{getFormLabel()}</span>}
                rules={[{ required: true, message: "Briefing content required." }]}
              >
                <TextArea
                  rows={6}
                  className="bg-bg-primary border-border-subtle text-white rounded-xl resize-none focus:border-accent-primary/40 transition-all p-4"
                  placeholder="Input technical requirements or operational constraints..."
                />
              </Form.Item>

              <Form.Item
                name="contactInfo"
                label={<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Communication Uplink (Email/Phone)</span>}
                rules={[{ required: true, message: "Contact information required." }]}
              >
                <Input
                  className="bg-bg-primary border-border-subtle text-white h-12 rounded-xl focus:border-accent-primary/40 transition-all px-4"
                  placeholder="ID@DOMAIN.COM"
                />
              </Form.Item>

              <button
                className="qsi-button primary w-full py-5 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-accent-primary/20 group/btn"
                type="submit"
                disabled={loading}
              >
                {loading ? 'SYNCHRONIZING...' : 'TRANSMIT BRIEFING'} 
                <Send size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </button>
            </Form>
          </Spin>
        </div>
      </div>

      {apiResponse && apiResponse.generatedPlan && (
        <div className="animate-fade-in">
           <div className="feed-card bg-success-green/10 border-success-green/30 p-8 lg:p-12">
              <div className="flex items-center gap-4 mb-8">
                 <CheckCircle2 size={32} className="text-success-green" />
                 <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Liberation Strategy Synthesized</h3>
                    <p className="text-[10px] font-bold text-success-green uppercase tracking-widest">Actionable Intelligence Generated</p>
                 </div>
              </div>
              
              <div className="bg-bg-primary/50 rounded-2xl p-8 border border-success-green/20">
                 <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                   {apiResponse.generatedPlan}
                 </pre>
              </div>

              <div className="mt-8 flex justify-end">
                 <button className="text-[10px] font-black text-success-green uppercase tracking-widest flex items-center gap-2 hover:underline">
                    Download Strategy <Layers size={14} />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionForm;
