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

interface WeeklyDigestProps {
  userName: string;
  weekOf: string;
  stats: {
    totalDecisions: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    flaggedRate: number;
    avgConfidence: number;
    accuracyRate: number;
  };
  topFlaggedSuppliers: { name: string; count: number; country: string }[];
  modelPerformance: {
    name: string;
    decisions: number;
    accuracy: number;
  }[];
  dashboardUrl: string;
}

export const WeeklyDigest: React.FC<Readonly<WeeklyDigestProps>> = ({
  userName = "Daniel",
  weekOf = "10 Mar – 16 Mar 2026",
  stats = {
    totalDecisions: 342,
    highRisk: 28,
    mediumRisk: 87,
    lowRisk: 227,
    flaggedRate: 8.2,
    avgConfidence: 91,
    accuracyRate: 94.3,
  },
  topFlaggedSuppliers = [
    { name: "Meridian Global Trading Ltd", count: 5, country: "Nigeria" },
    { name: "Eastbridge Commodities", count: 3, country: "Myanmar" },
    { name: "Pacific Rim Holdings", count: 2, country: "Cambodia" },
  ],
  modelPerformance = [
    { name: "Fraud Analyst — Carl", decisions: 198, accuracy: 95.2 },
    { name: "Compliance Check — Ada", decisions: 144, accuracy: 93.1 },
  ],
  dashboardUrl = "https://app.merlynn.co.za/dashboard",
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        {`Weekly Risk Digest — ${stats.totalDecisions} decisions processed, ${stats.highRisk} high-risk`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>Merlynn</Text>
            <Text style={logoSubtext}>Weekly Risk Digest</Text>
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={intro}>
              Here&apos;s your risk monitoring summary for <strong>{weekOf}</strong>.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Key Metrics */}
          <Section style={section}>
            <Heading as="h2" style={sectionTitle}>
              Key Metrics
            </Heading>
            <Row>
              <Column style={metricCard}>
                <Text style={metricValue}>{stats.totalDecisions}</Text>
                <Text style={metricLabel}>Decisions</Text>
              </Column>
              <Column style={{ ...metricCard, ...metricCardHigh }}>
                <Text style={{ ...metricValue, color: "#dc2626" }}>{stats.highRisk}</Text>
                <Text style={metricLabel}>High Risk</Text>
              </Column>
              <Column style={metricCard}>
                <Text style={{ ...metricValue, color: "#2563eb" }}>{stats.avgConfidence}%</Text>
                <Text style={metricLabel}>Avg Confidence</Text>
              </Column>
              <Column style={metricCard}>
                <Text style={{ ...metricValue, color: "#16a34a" }}>{stats.accuracyRate}%</Text>
                <Text style={metricLabel}>Accuracy</Text>
              </Column>
            </Row>
          </Section>

          {/* Risk Breakdown */}
          <Section style={section}>
            <Heading as="h2" style={sectionTitle}>
              Risk Breakdown
            </Heading>
            <Row style={breakdownRow}>
              <Column>
                <Text style={breakdownItem}>
                  <span style={dotHigh} /> High: {stats.highRisk} (
                  {((stats.highRisk / stats.totalDecisions) * 100).toFixed(1)}%)
                </Text>
              </Column>
              <Column>
                <Text style={breakdownItem}>
                  <span style={dotMedium} /> Medium: {stats.mediumRisk} (
                  {((stats.mediumRisk / stats.totalDecisions) * 100).toFixed(1)}
                  %)
                </Text>
              </Column>
              <Column>
                <Text style={breakdownItem}>
                  <span style={dotLow} /> Low: {stats.lowRisk} (
                  {((stats.lowRisk / stats.totalDecisions) * 100).toFixed(1)}%)
                </Text>
              </Column>
            </Row>
            {/* Visual bar */}
            <Row>
              <Column>
                <div style={barContainer}>
                  <div
                    style={{
                      ...barSegment,
                      width: `${(stats.highRisk / stats.totalDecisions) * 100}%`,
                      backgroundColor: "#dc2626",
                      borderRadius: "4px 0 0 4px",
                    }}
                  />
                  <div
                    style={{
                      ...barSegment,
                      width: `${(stats.mediumRisk / stats.totalDecisions) * 100}%`,
                      backgroundColor: "#d97706",
                    }}
                  />
                  <div
                    style={{
                      ...barSegment,
                      width: `${(stats.lowRisk / stats.totalDecisions) * 100}%`,
                      backgroundColor: "#16a34a",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                </div>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Top Flagged Suppliers */}
          <Section style={section}>
            <Heading as="h2" style={sectionTitle}>
              Top Flagged Suppliers
            </Heading>
            {topFlaggedSuppliers.map((s, i) => (
              <Row key={i} style={supplierRow}>
                <Column style={supplierRank}>{i + 1}</Column>
                <Column style={supplierInfo}>
                  <Text style={supplierName}>{s.name}</Text>
                  <Text style={supplierCountry}>{s.country}</Text>
                </Column>
                <Column style={supplierCount} align="right">
                  <Text style={supplierCountText}>{s.count} flagged</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Model Performance */}
          <Section style={section}>
            <Heading as="h2" style={sectionTitle}>
              Model Performance
            </Heading>
            {modelPerformance.map((m, i) => (
              <Row key={i} style={modelRow}>
                <Column style={modelInfo}>
                  <Text style={modelName}>{m.name}</Text>
                  <Text style={modelDecisions}>{m.decisions} decisions processed</Text>
                </Column>
                <Column style={modelAccuracy} align="right">
                  <Text style={modelAccuracyText}>{m.accuracy}%</Text>
                  <Text style={modelAccuracyLabel}>accuracy</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={{ ...section, textAlign: "center" as const }}>
            <Link href={dashboardUrl} style={ctaButton}>
              View Dashboard
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>This weekly digest is sent every Monday at 08:00 SAST.</Text>
            <Text style={footerText}>Merlynn Risk Monitor — Automated decision intelligence.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WeeklyDigest;

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
  color: "#60a5fa",
  fontSize: "12px",
  margin: "2px 0 0",
  lineHeight: "16px",
  letterSpacing: "0.5px",
  textTransform: "uppercase" as const,
};

const section: React.CSSProperties = {
  padding: "20px 32px",
  backgroundColor: "#ffffff",
};

const greeting: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "16px",
  fontWeight: 600,
  margin: "0 0 8px",
};

const intro: React.CSSProperties = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "22px",
  margin: 0,
};

const sectionTitle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#64748b",
  margin: "0 0 16px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const divider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: 0,
};

const metricCard: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "12px 8px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  margin: "0 4px",
};

const metricCardHigh: React.CSSProperties = {
  backgroundColor: "#fef2f2",
};

const metricValue: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#0f172a",
  margin: 0,
  lineHeight: "28px",
};

const metricLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#64748b",
  margin: "4px 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.3px",
};

const breakdownRow: React.CSSProperties = {
  marginBottom: "12px",
};

const breakdownItem: React.CSSProperties = {
  fontSize: "13px",
  color: "#334155",
  margin: 0,
};

const dotHigh: React.CSSProperties = {
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#dc2626",
  marginRight: "6px",
};

const dotMedium: React.CSSProperties = {
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#d97706",
  marginRight: "6px",
};

const dotLow: React.CSSProperties = {
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#16a34a",
  marginRight: "6px",
};

const barContainer: React.CSSProperties = {
  display: "flex",
  height: "10px",
  borderRadius: "4px",
  overflow: "hidden",
  backgroundColor: "#e2e8f0",
};

const barSegment: React.CSSProperties = {
  height: "100%",
};

const supplierRow: React.CSSProperties = {
  padding: "10px 0",
  borderBottom: "1px solid #f1f5f9",
};

const supplierRank: React.CSSProperties = {
  width: "28px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#94a3b8",
  verticalAlign: "top",
};

const supplierInfo: React.CSSProperties = {
  verticalAlign: "top",
};

const supplierName: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#0f172a",
  margin: 0,
  lineHeight: "18px",
};

const supplierCountry: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  margin: "2px 0 0",
};

const supplierCount: React.CSSProperties = {
  width: "80px",
  verticalAlign: "middle",
};

const supplierCountText: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#dc2626",
  margin: 0,
  backgroundColor: "#fef2f2",
  padding: "4px 10px",
  borderRadius: "12px",
  display: "inline-block",
};

const modelRow: React.CSSProperties = {
  padding: "12px 0",
  borderBottom: "1px solid #f1f5f9",
};

const modelInfo: React.CSSProperties = {
  verticalAlign: "middle",
};

const modelName: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#0f172a",
  margin: 0,
};

const modelDecisions: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  margin: "2px 0 0",
};

const modelAccuracy: React.CSSProperties = {
  width: "80px",
  verticalAlign: "middle",
};

const modelAccuracyText: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#16a34a",
  margin: 0,
  lineHeight: "22px",
};

const modelAccuracyLabel: React.CSSProperties = {
  fontSize: "10px",
  color: "#94a3b8",
  margin: 0,
  textTransform: "uppercase" as const,
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
