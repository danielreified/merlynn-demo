describe("Risk Dashboard", () => {
  beforeEach(() => {
    cy.visit("/dashboard");
  });

  it("displays stat cards on the dashboard", () => {
    cy.get('[data-testid="stat-cards"]').should("be.visible");
    cy.contains("Total Today").should("be.visible");
    cy.contains("High Risk").should("be.visible");
    cy.contains("Under Review").should("be.visible");
    cy.contains("Pass Rate").should("be.visible");
  });

  it("displays the decisions table", () => {
    cy.contains("Recent Decisions").should("be.visible");
    cy.get("table").should("be.visible");
    cy.get("table tbody tr").should("have.length.greaterThan", 0);
  });

  it("navigates to a decision detail page", () => {
    cy.get("table tbody tr").first().find("a").first().click();
    cy.url().should("include", "/decisions/");
    cy.contains("Risk Score").should("be.visible");
    cy.get('[data-testid="shap-values"]').should("be.visible");
    cy.contains("Factor Contributions").should("be.visible");
  });

  it("can navigate back to dashboard from detail page", () => {
    cy.get("table tbody tr").first().find("a").first().click();
    cy.contains("Back to Dashboard").click();
    cy.url().should("include", "/dashboard");
  });
});
