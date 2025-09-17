describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the landing page', () => {
    cy.contains('SoloAdventurer').should('be.visible');
    cy.contains('Connect with fellow solo travelers').should('be.visible');
  });

  it('should navigate to signup page', () => {
    cy.contains('Start Your Journey').click();
    cy.url().should('include', '/signup');
    cy.contains('Create Account').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.contains('Sign In').click();
    cy.url().should('include', '/login');
    cy.contains('Welcome Back').should('be.visible');
  });

  it('should allow user signup', () => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const password = 'TestPassword123!';
    
    cy.signup('Test User', email, password);
    
    // Should redirect to dashboard after successful signup
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, Test User!').should('be.visible');
  });

  it('should allow user login', () => {
    const email = 'test@example.com';
    const password = 'TestPassword123!';
    
    cy.login(email, password);
    
    // Should be on dashboard after login
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, test!').should('be.visible');
  });

  it('should show validation errors for invalid signup', () => {
    cy.visit('/signup');
    
    // Try to submit with empty form
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.contains('required').should('be.visible');
  });

  it('should show error for mismatched passwords', () => {
    cy.visit('/signup');
    
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('Passwords do not match').should('be.visible');
  });
});

describe('Navigation', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPassword123!');
  });

  it('should display navigation header', () => {
    cy.contains('SoloAdventurer').should('be.visible');
    cy.contains('Explore').should('be.visible');
    cy.contains('Messages').should('be.visible');
  });

  it('should allow navigation to profile', () => {
    cy.get('img[alt*="avatar"]').click();
    cy.url().should('include', '/profile');
    cy.contains('Edit Profile').should('be.visible');
  });

  it('should display mobile menu on small screens', () => {
    cy.viewport('iphone-x');
    cy.get('button[aria-label="Toggle menu"]').click();
    cy.contains('Sign Out').should('be.visible');
  });

  it('should allow logout', () => {
    cy.contains('Sign Out').click();
    cy.url().should('include', '/');
  });
});

describe('Profile Management', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPassword123!');
    cy.visit('/profile');
  });

  it('should display profile information', () => {
    cy.contains('Profile Completion').should('be.visible');
    cy.contains('Travel Statistics').should('be.visible');
  });

  it('should allow profile editing', () => {
    cy.contains('Edit Profile').click();
    
    cy.get('input[name="bio"]').type('I love traveling and meeting new people!');
    cy.get('input[name="location"]').type('San Francisco, CA');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('Profile updated successfully!').should('be.visible');
  });

  it('should show quick actions', () => {
    cy.contains('Upload Avatar').should('be.visible');
    cy.contains('Add Travel Preferences').should('be.visible');
    cy.contains('Set Travel Interests').should('be.visible');
  });
});