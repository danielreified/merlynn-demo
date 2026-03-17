import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Link,
} from "@react-email/components";
import * as React from "react";

interface RiskAlertProps {
  transactionId: string;
  supplierName: string;
  amount: number;
  country: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  riskScore: number;
  confidence: number;
  modelName: string;
  explanation: string;
  topFactors: { factor: string; contribution: number }[];
  decisionUrl: string;
}

const riskColors = {
  HIGH: { bg: "#fef2f2", border: "#dc2626", text: "#991b1b", badge: "#dc2626" },
  MEDIUM: { bg: "#fffbeb", border: "#d97706", text: "#92400e", badge: "#d97706" },
  LOW: { bg: "#f0fdf4", border: "#16a34a", text: "#166534", badge: "#16a34a" },
};

export const RiskAlert: React.FC<Readonly<RiskAlertProps>> = ({
  transactionId = "TXN-2026-0301",
  supplierName = "Meridian Global Trading Ltd",
  amount = 2450000,
  country = "Nigeria",
  riskLevel = "HIGH",
  riskScore = 85,
  confidence = 92,
  modelName = "Fraud Analyst — Carl",
  explanation = "High-value cross-border transaction with supplier in elevated-risk jurisdiction.",
  topFactors = [
    { factor: "Transaction Amount", contribution: 0.35 },
    { factor: "Country Risk Score", contribution: 0.28 },
    { factor: "Supplier History", contribution: 0.18 },
  ],
  decisionUrl = "https://app.merlynn.co.za/decisions/123",
}) => {
  const colors = riskColors[riskLevel];

  return (
    <Html>
      <Head />
      <Preview>
        {riskLevel} Risk Alert — {transactionId} ({supplierName})
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>Merlynn</Text>
            <Text style={logoSubtext}>Risk Monitor</Text>
          </Section>

          {/* Alert Banner */}
          <Section
            style={{
              ...alertBanner,
              backgroundColor: colors.bg,
              borderLeft: `4px solid ${colors.border}`,
            }}
          >
            <Row>
              <Column>
                <Text style={{ ...alertTitle, color: colors.text }}>
                  {riskLevel} RISK TRANSACTION DETECTED
                </Text>
                <Text style={{ ...alertSubtitle, color: colors.text }}>Flagged by {modelName}</Text>
              </Column>
              <Column align="right">
                <Text
                  style={{
                    ...riskBadge,
                    backgroundColor: colors.badge,
                  }}
                >
                  Score: {riskScore}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Transaction Details */}
          <Section style={section}>
            <Heading as="h2" style={sectionTitle}>
              Transaction Details
            </Heading>
            <Row style={detailRow}>
              <Column style={detailLabel}>Transaction ID</Column>
              <Column style={detailValue}>{transactionId}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Supplier</Column>
              <Column style={detailValue}>{supplierName}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Amount</Column>
              <Column style={detailValue}>${amount.toLocaleString("en-US")}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Country</Column>
              <Column style={detailValue}>{country}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Confidence</Column>
              <Column style={detailValue}>{confidence}%</Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Explanation */}
          <Section style={section}>
            <Heading as="h2" style={sectionTitle}>
              Risk Assessment
            </Heading>
            <Text style={explanationText}>{explanation}</Text>
          </Section>

          {/* Contributing Factors */}
          <Section style={section}>
            <Heading as="h2" style={sectionTitle}>
              Top Contributing Factors
            </Heading>
            {topFactors.map((f, i) => (
              <Row key={i} style={factorRow}>
                <Column style={factorName}>{f.factor}</Column>
                <Column style={factorBar} align="right">
                  <div
                    style={{
                      ...factorBarInner,
                      width: `${Math.round(Math.abs(f.contribution) * 100)}%`,
                      backgroundColor: f.contribution > 0 ? "#dc2626" : "#16a34a",
                    }}
                  />
                </Column>
                <Column style={factorValue}>
                  {f.contribution > 0 ? "+" : ""}
                  {(f.contribution * 100).toFixed(0)}%
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={{ ...section, textAlign: "center" as const }}>
            <Link href={decisionUrl} style={ctaButton}>
              Review Decision
            </Link>
            <Text style={ctaSubtext}>
              View the full decision details, provide feedback, or escalate.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>This is an automated alert from Merlynn Risk Monitor.</Text>
            <Text style={footerText}>
              You&apos;re receiving this because you have alerts enabled for{" "}
              {riskLevel.toLowerCase()}-risk transactions.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default RiskAlert;

// -- Styles --

const main: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
};

const header: React.CSSProperties = {
  padding: "24px 32px",
  backgroundColor: "#0f172a",
  borderRadius: "12px 12px 0 0",
};

const logoText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 700,
  margin: 0,
  lineHeight: "24px",
};

const logoSubtext: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: 0,
  lineHeight: "16px",
};

const alertBanner: React.CSSProperties = {
  padding: "16px 24px",
  borderRadius: 0,
};

const alertTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  margin: 0,
  lineHeight: "20px",
  letterSpacing: "0.5px",
};

const alertSubtitle: React.CSSProperties = {
  fontSize: "12px",
  margin: "4px 0 0",
  lineHeight: "16px",
  opacity: 0.8,
};

const riskBadge: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 700,
  padding: "6px 14px",
  borderRadius: "20px",
  display: "inline-block",
  margin: 0,
};

const section: React.CSSProperties = {
  padding: "20px 32px",
  backgroundColor: "#ffffff",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#0f172a",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const detailRow: React.CSSProperties = {
  marginBottom: "8px",
};

const detailLabel: React.CSSProperties = {
  color: "#64748b",
  fontSize: "13px",
  width: "140px",
  verticalAlign: "top",
  paddingBottom: "8px",
};

const detailValue: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "13px",
  fontWeight: 500,
  verticalAlign: "top",
  paddingBottom: "8px",
};

const divider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: 0,
};

const explanationText: React.CSSProperties = {
  color: "#334155",
  fontSize: "14px",
  lineHeight: "22px",
  margin: 0,
};

const factorRow: React.CSSProperties = {
  marginBottom: "8px",
};

const factorName: React.CSSProperties = {
  color: "#334155",
  fontSize: "13px",
  width: "180px",
  verticalAlign: "middle",
};

const factorBar: React.CSSProperties = {
  width: "120px",
  verticalAlign: "middle",
};

const factorBarInner: React.CSSProperties = {
  height: "8px",
  borderRadius: "4px",
  display: "inline-block",
};

const factorValue: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 600,
  width: "50px",
  textAlign: "right" as const,
  verticalAlign: "middle",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  padding: "12px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
};

const ctaSubtext: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  marginTop: "12px",
};

const footer: React.CSSProperties = {
  padding: "20px 32px",
  backgroundColor: "#f1f5f9",
  borderRadius: "0 0 12px 12px",
};

const footerText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "11px",
  lineHeight: "16px",
  margin: "0 0 4px",
};
