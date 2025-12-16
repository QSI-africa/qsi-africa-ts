import React from 'react';
import { useState } from "react";
import { Row, Col, Card, Typography, Pagination } from "antd";
import { RocketOutlined, ArrowRightOutlined } from "@ant-design/icons";
const { Title, Paragraph, Link } = Typography;

export default function PilotsGrid({ pilots, token, isMobile, navigate }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // number of pilots per page

  // Calculate which pilots to show on the current page
  const startIndex = (currentPage - 1) * pageSize;
  const currentPilots = pilots.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <Row gutter={[token.margin, token.margin]}>
        {currentPilots.map((pilot) => (
          <Col key={pilot.key || pilot.id} xs={24} md={8}>
            <Card
              hoverable
              style={{
                backgroundColor: token.colorBgElevated,
                minHeight: isMobile ? 200 : 220,
                height: "100%",
              }}
              bodyStyle={{
                padding: isMobile ? token.paddingSM : token.padding,
              }}
              onClick={() => navigate(`/pilots/${pilot.key}`)}
            >
              <Title
                level={5}
                style={{
                  margin: `0 0 ${token.marginSM}px 0`,
                  color: token.colorText,
                }}
              >
                <RocketOutlined
                  style={{
                    marginRight: token.marginXXS,
                    color: token.colorPrimary,
                  }}
                />{" "}
                {pilot.title}
              </Title>
              <Paragraph
                style={{
                  color: token.colorTextSecondary,
                  fontSize: isMobile ? token.fontSizeSM : token.fontSize,
                  minHeight: "60px",
                }}
              >
                {pilot.shortDescription}
              </Paragraph>
              <Link
                style={{
                  fontWeight: token.fontWeightMedium,
                  color: token.colorPrimary,
                }}
              >
                View Details <ArrowRightOutlined />
              </Link>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination Component */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: token.marginXL,
        }}
      >
        <Pagination
          current={currentPage}
          total={pilots.length}
          pageSize={pageSize}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </>
  );
}
