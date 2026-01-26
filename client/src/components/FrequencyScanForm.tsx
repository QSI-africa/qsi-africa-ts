// src/components/FrequencyScanForm.tsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Select, Steps, message, Spin } from 'antd';
import { ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface FrequencyScanFormProps {
  onComplete: () => void;
}

const FrequencyScanForm: React.FC<FrequencyScanFormProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user, refetchUser } = useAuth();

  const steps = [
    {
      title: 'Environment',
      description: 'Your physical location',
      fields: ['location'],
    },
    {
      title: 'Beliefs',
      description: 'Your core values',
      fields: ['personalBeliefs'],
    },
    {
      title: 'Background',
      description: 'Your history',
      fields: ['background'],
    },
    {
      title: 'Vision',
      description: 'Your aspirations',
      fields: ['lifeVision', 'challenges'],
    },
  ];

  const handleNext = async () => {
    try {
      const fieldsToValidate = steps[currentStep].fields;
      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // access error
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      
      // We need a specific endpoint for creating a scan.
      // Assuming generic submission or dedicated one. Since we don't have a dedicated one yet,
      // I'll create one or use a "submit/scan" logic. 
      // I'll assume /submit/scan exists or I will create it in submissionRoutes.
      // Wait, I need to create the endpoint too!
      
      await axios.post(`${baseURL}/submit/scan`, {
        ...values,
        userId: user?.id,
      });

      message.success('Frequency Scan completed successfully!');
      await refetchUser(); // Refresh user to see the new scan
      onComplete();
    } catch (error) {
      console.error('Scan submission failed:', error);
      message.error('Failed to submit scan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      bordered={false} 
      style={{ 
        maxWidth: 800, 
        margin: '0 auto',
        padding: 24,
        background: 'transparent'
      }}
    >
      <div style={{ marginBottom: 40 }}>
        <Title level={2} style={{ textAlign: 'center' }}>Frequency Scan</Title>
        <Paragraph style={{ textAlign: 'center', fontSize: 16 }}>
          Aligning your internal resonance with your external reality.
        </Paragraph>
      </div>

      <Steps current={currentStep} style={{ marginBottom: 40 }}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
            location: user?.location || '', // Optional prefill
        }}
      >
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
           <Form.Item
            name="location"
            label="Current Location"
            rules={[{ required: true, message: 'Please enter your location' }]}
           >
             <Input placeholder="City, Country" size="large" />
           </Form.Item>
           <Paragraph type="secondary">
             Your environment plays a key role in your frequency. Where are you anchored?
           </Paragraph>
        </div>

        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
           <Form.Item
            name="personalBeliefs"
            label="Key Personal Beliefs"
            rules={[{ required: true, message: 'Please share a core belief' }]}
           >
             <TextArea rows={4} placeholder="What do you believe to be true about yourself and the world?" />
           </Form.Item>
        </div>

        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
           <Form.Item
            name="background"
            label="Background & Context"
            rules={[{ required: true, message: 'Please share your background' }]}
           >
             <TextArea rows={4} placeholder="Briefly describe your professional or personal background..." />
           </Form.Item>
        </div>

        <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
           <Form.Item
            name="lifeVision"
            label="Life Vision"
            rules={[{ required: true, message: 'Please share your vision' }]}
           >
             <TextArea rows={4} placeholder="What is the highest vision for your life?" />
           </Form.Item>
           <Form.Item
            name="challenges"
            label="Current Challenges"
           >
             <TextArea rows={3} placeholder="What is currently blocking your flow?" />
           </Form.Item>
        </div>

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
          {currentStep > 0 && (
            <Button onClick={handlePrev} size="large">
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext} size="large" icon={<ArrowRightOutlined />}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" htmlType="submit" loading={loading} size="large" icon={<CheckOutlined />}>
              Complete Scan
            </Button>
          )}
        </div>
      </Form>
    </Card>
  );
};

export default FrequencyScanForm;
