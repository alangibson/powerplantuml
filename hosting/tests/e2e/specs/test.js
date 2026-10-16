// https://docs.cypress.io/api/introduction/api.html

describe('Editor smoke test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.contains('a.navbar-brand', 'PowerPlantUML').should('be.visible')
    cy.get('.CodeMirror').should('be.visible')
  })
})
