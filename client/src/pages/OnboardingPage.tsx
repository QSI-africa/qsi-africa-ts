// client/src/pages/OnboardingPage.jsx
import React, { useState  } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  App as AntApp,
  Steps,
  Grid,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api"; // Use the client-side api instance

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

// Define the steps for the onboarding process
const steps = [
  { title: "Welcome", content: "Introduction" },
  { title: "Your Profile", content: "Background & Beliefs" },
  { title: "Your Vision", content: "Goals & Challenges" },
];

const OnboardingPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [current, setCurrent] = useState<number>(0); // Current step
  const [form] = Form.useForm();
  const { user, token, refetchUser } = useAuth(); // Get user, token, and refetch function
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const screens = useBreakpoint();

  // Function to go to the next step
  const handleNext = async () => {
    try {
      // Validate fields for the current step
      if (current === 1) {
        await form.validateFields([
          "location",
          "personalBeliefs",
          "background",
        ]);
      } else if (current === 2) {
        await form.validateFields(["lifeVision", "challenges"]);
      }
      setCurrent(current + 1);
    } catch (err) {
      console.log("Validation failed:", err);
    }
  };

  // Function to go to the previous step
  const handlePrev = () => {
    setCurrent(current - 1);
  };

  // Function to handle the final form submission
  const onFinish = async (values) => {
    setLoading(true);
    const profileData = {
      fullName: user?.name || "User", // Get name from auth context
      location: values.location,
      personalBeliefs: values.personalBeliefs,
      background: values.background,
      lifeVision: values.lifeVision,
      challenges: values.challenges,
    };

    try {
      // Ensure auth header is set
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.post("/onboarding/profile", profileData);

      message.success("Profile created successfully! AI analysis is underway.");

      // Refetch the user data in the AuthContext to include the new profile
      // This will update `user.frequencyProfile` and allow access to the main app
      if (refetchUser) {
        await refetchUser();
      }

      navigate("/"); // Navigate to the main app
    } catch (err) {
      console.error("Profile creation failed:", err);
      message.error(err.response?.data?.error || "Failed to create profile.");
    } finally {
      setLoading(false);
    }
  };

  // Responsive styles
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    padding: screens.xs ? "16px" : "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: screens.xs ? "100%" : screens.sm ? "90%" : "800px",
    margin: "0 auto",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "none",
    borderRadius: "12px",
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: screens.xs ? "20px" : "24px",
    marginBottom: screens.xs ? "8px" : "16px",
  };

  const paragraphStyle = {
    textAlign: "center",
    fontSize: screens.xs ? "13px" : "14px",
    marginBottom: screens.xs ? "16px" : "24px",
  };

  const stepsStyle = {
    marginBottom: screens.xs ? "16px" : "24px",
  };

  const contentStyle = {
    minHeight: screens.xs ? "150px" : "200px",
    padding: screens.xs ? "8px 0" : "16px 0",
  };

  const formItemStyle = {
    marginBottom: screens.xs ? "16px" : "24px",
  };

  const buttonContainerStyle = {
    marginTop: screens.xs ? "16px" : "24px",
    display: "flex",
    justifyContent: "space-between",
    gap: screens.xs ? "8px" : "16px",
  };

  const buttonStyle = {
    flex: screens.xs ? 1 : "none",
    height: screens.xs ? "40px" : "auto",
  };

  return (
    <div style={containerStyle}>
      <Card style={cardStyle}>
        <Title level={screens.xs ? 4 : 3} style={titleStyle}>
          Welcome to QSI
        </Title>
        <Paragraph style={paragraphStyle} type="secondary">
          Let's create your Frequency Profile. This helps us understand your
          vision and challenges to provide aligned solutions.
        </Paragraph>

        <Steps
          current={current}
          items={steps.map((s) => ({
            title: screens.xs ? "" : s.title,
            description: screens.xs ? s.title : undefined,
          }))}
          style={stepsStyle}
          size={screens.xs ? "small" : "default"}
          responsive={false}
        />

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Step 0: Welcome */}
          <div
            style={{
              display: current === 0 ? "block" : "none",
              ...contentStyle,
            }}
          >
            <Title level={screens.xs ? 5 : 4}>The Frequency Scan</Title>
            <Paragraph
              type="secondary"
              style={{ fontSize: screens.xs ? "13px" : "14px" }}
            >
              To provide you with coherent guidance, QSI first understands your
              unique energetic signature. This involves mapping your worldview,
              vision, and current challenges.
            </Paragraph>
            <Paragraph style={{ fontSize: screens.xs ? "13px" : "14px" }}>
              This one-time setup will take about 2-3 minutes.
            </Paragraph>
          </div>

          {/* Step 1: Background & Beliefs */}
          <div style={{ display: current === 1 ? "block" : "none" }}>
            <Form.Item
              name="location"
              label="Location (City, Country)"
              rules={[{ required: true }]}
              style={formItemStyle}
            >
              <Input
                size={screens.xs ? "small" : "middle"}
                placeholder="e.g., Harare, Zimbabwe"
              />
            </Form.Item>
            <Form.Item
              name="personalBeliefs"
              label="Personal Beliefs & Worldview"
              rules={[{ required: true }]}
              style={formItemStyle}
            >
              <TextArea
                rows={screens.xs ? 3 : 4}
                size={screens.xs ? "small" : "middle"}
                placeholder="What are your core beliefs about the world, spirituality, or your place in it?"
              />
            </Form.Item>
            <Form.Item
              name="background"
              label="Educational & Professional Background"
              rules={[{ required: true }]}
              style={formItemStyle}
            >
              <TextArea
                rows={screens.xs ? 3 : 4}
                size={screens.xs ? "small" : "middle"}
                placeholder="Briefly describe your background (e.g., education, career path, key skills)."
              />
            </Form.Item>
          </div>

          {/* Step 2: Vision & Challenges */}
          <div style={{ display: current === 2 ? "block" : "none" }}>
            <Form.Item
              name="lifeVision"
              label="Life Vision (Goals, Timelines, Trajectory)"
              rules={[{ required: true }]}
              style={formItemStyle}
            >
              <TextArea
                rows={screens.xs ? 3 : 4}
                size={screens.xs ? "small" : "middle"}
                placeholder="What do you want to create or achieve?"
              />
            </Form.Item>
            <Form.Item
              name="challenges"
              label="Current Challenges (Emotional, Relational, Financial, etc.)"
              rules={[{ required: true }]}
              style={formItemStyle}
            >
              <TextArea
                rows={screens.xs ? 3 : 4}
                size={screens.xs ? "small" : "middle"}
                placeholder="What are your main obstacles right now?"
              />
            </Form.Item>
          </div>

          {/* Navigation Buttons */}
          <div style={buttonContainerStyle}>
            {current > 0 ? (
              <Button
                onClick={handlePrev}
                style={buttonStyle}
                size={screens.xs ? "small" : "middle"}
              >
                Previous
              </Button>
            ) : (
              <div style={buttonStyle} /> // Placeholder for spacing
            )}

            {current < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={handleNext}
                style={buttonStyle}
                size={screens.xs ? "small" : "middle"}
              >
                Next
              </Button>
            ) : current === steps.length - 1 ? (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={buttonStyle}
                size={screens.xs ? "small" : "middle"}
              >
                Create Profile
              </Button>
            ) : null}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default OnboardingPage;
