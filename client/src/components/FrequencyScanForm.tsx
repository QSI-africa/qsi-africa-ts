import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Select, Steps, message, Spin, Grid } from 'antd';
import { ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { useBreakpoint } = Grid;

interface FrequencyScanFormProps {
  onComplete: () => void;
}

const FrequencyScanForm: React.FC<FrequencyScanFormProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user, refetchUser } = useAuth();
  const screens = useBreakpoint();

  const steps = [
    {
      title: 'Environment',
      description: screens.md ? 'Your physical location' : '',
      fields: ['location'],
    },
    {
      title: 'Beliefs',
      description: screens.md ? 'Your core values' : '',
      fields: ['personalBeliefs'],
    },
    {
      title: 'Background',
      description: screens.md ? 'Your history' : '',
      fields: ['background'],
    },
    {
      title: 'Vision',
      description: screens.md ? 'Your aspirations' : '',
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
      // NOTE: backend endpoint was confirmed as /api/onboarding/profile which is mapped to onboardingRoutes.js
      // Wait, in onboardingRoutes.js it is router.post("/profile" ...)
      // So the URL should be `${baseURL}/onboarding/profile`

      await axios.post(`${baseURL}/onboarding/profile`, {
        ...values,
        // userId is extracted from token in middleware
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // Ensure token is sent
        }
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
        maxWidth: screens.md ? 800 : '100%',
        margin: '0 auto',
        padding: screens.md ? 24 : 12,
        background: 'transparent'
      }}
      bodyStyle={{ padding: screens.md ? 24 : 0 }}
    >
      <div style={{ marginBottom: screens.md ? 40 : 24 }}>
        <Title level={screens.md ? 2 : 3} style={{ textAlign: 'center' }}>Frequency Scan</Title>
        <Paragraph style={{ textAlign: 'center', fontSize: screens.md ? 16 : 14, padding: '0 10px' }}>
          Aligning your internal resonance with your external reality.
        </Paragraph>
      </div>

      <Steps
        current={currentStep}
        style={{ marginBottom: screens.md ? 40 : 24 }}
        size={screens.md ? "default" : "small"}
        direction="horizontal"
        labelPlacement="horizontal"
      >
        {steps.map(item => (
          <Step key={item.title} title={item.title} description={item.description} />
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
            <TextArea rows={screens.md ? 4 : 3} placeholder="What do you believe to be true about yourself and the world?" />
          </Form.Item>
        </div>

        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <Form.Item
            name="background"
            label="Background & Context"
            rules={[{ required: true, message: 'Please share your background' }]}
          >
            <TextArea rows={screens.md ? 4 : 3} placeholder="Briefly describe your professional or personal background..." />
          </Form.Item>
        </div>

        <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
          <Form.Item
            name="lifeVision"
            label="Life Vision"
            rules={[{ required: true, message: 'Please share your vision' }]}
          >
            <TextArea rows={screens.md ? 4 : 3} placeholder="What is the highest vision for your life?" />
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
          {currentStep === 0 && <div />} {/* Spacer if no previous button */}

          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext} size="large" icon={<ArrowRightOutlined />} iconPosition="end">
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" htmlType="submit" loading={loading} size="large" icon={<CheckOutlined />}>
              Complete It
            </Button>
          )}
        </div>
      </Form>
    </Card>
  );
};

export default FrequencyScanForm;
