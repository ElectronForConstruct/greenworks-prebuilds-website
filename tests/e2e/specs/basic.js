describe('My First Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load home', () => {
    cy.get('.home')
      .should('exist');
  });

  it('should load entries', () => {
    cy.get('.home table tbody tr')
      .should('have.length', 10);
  });
});
