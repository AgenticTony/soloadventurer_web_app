describe('Trip Management', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPassword123!');
  });

  it('should display trips dashboard', () => {
    cy.visit('/dashboard');
    cy.contains('My Trips').should('be.visible');
    cy.contains('Create New Trip').should('be.visible');
  });

  it('should allow creating a new trip', () => {
    cy.visit('/dashboard');
    cy.contains('Create New Trip').click();
    
    cy.url().should('include', '/trips/create');
    
    // Fill in trip details
    cy.get('input[name="title"]').type('European Adventure');
    cy.get('textarea[name="description"]').type('A month-long journey through Europe');
    cy.get('input[name="startDate"]').type('2024-06-01');
    cy.get('input[name="endDate"]').type('2024-06-30');
    
    // Add destination
    cy.get('input[name="destination"]').type('Paris, France');
    cy.contains('Add Destination').click();
    
    cy.get('button[type="submit"]').click();
    
    // Should redirect to trip details
    cy.url().should('include', '/trips/');
    cy.contains('European Adventure').should('be.visible');
  });

  it('should display trip details', () => {
    cy.visit('/trips/test-trip-id');
    
    cy.contains('Trip Details').should('be.visible');
    cy.contains('Destination').should('be.visible');
    cy.contains('Travelers').should('be.visible');
    cy.contains('Itinerary').should('be.visible');
    cy.contains('Expenses').should('be.visible');
  });

  it('should allow adding trip itinerary items', () => {
    cy.visit('/trips/test-trip-id');
    cy.contains('Add to Itinerary').click();
    
    cy.get('select[name="type"]').select('activity');
    cy.get('input[name="title"]').type('Visit Eiffel Tower');
    cy.get('textarea[name="description"]').type('Visit the iconic Eiffel Tower');
    cy.get('input[name="startTime"]').type('2024-06-15T10:00');
    cy.get('input[name="location"]').type('Champ de Mars, Paris');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('Visit Eiffel Tower').should('be.visible');
  });

  it('should allow adding trip expenses', () => {
    cy.visit('/trips/test-trip-id');
    cy.contains('Add Expense').click();
    
    cy.get('select[name="category"]').select('accommodation');
    cy.get('input[name="amount"]').type('150.00');
    cy.get('input[name="description"]').type('Hotel room for one night');
    cy.get('input[name="date"]').type('2024-06-15');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('Hotel room for one night').should('be.visible');
    cy.contains('$150.00').should('be.visible');
  });

  it('should allow editing trip details', () => {
    cy.visit('/trips/test-trip-id');
    cy.contains('Edit Trip').click();
    
    cy.get('input[name="title"]').clear().type('Updated European Adventure');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Updated European Adventure').should('be.visible');
  });

  it('should allow inviting travelers to trip', () => {
    cy.visit('/trips/test-trip-id');
    cy.contains('Invite Travelers').click();
    
    cy.get('input[name="email"]').type('traveler@example.com');
    cy.contains('Send Invite').click();
    
    cy.contains('Invite sent to traveler@example.com').should('be.visible');
  });

  it('should display trip statistics', () => {
    cy.visit('/trips/test-trip-id');
    cy.contains('Trip Statistics').should('be.visible');
    cy.contains('Total Expenses').should('be.visible');
    cy.contains('Daily Average').should('be.visible');
    cy.contains('Expenses by Category').should('be.visible');
  });
});

describe('Trip Posts and Social Features', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPassword123!');
    cy.visit('/trips/test-trip-id');
  });

  it('should allow creating trip posts', () => {
    cy.contains('Create Post').click();
    
    cy.get('input[name="title"]').type('Amazing Day in Paris');
    cy.get('textarea[name="content"]').type('Had an incredible day exploring the city of lights!');
    cy.get('input[name="location"]').type('Paris, France');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('Amazing Day in Paris').should('be.visible');
  });

  it('should allow liking posts', () => {
    cy.get('[data-testid="like-button"]').first().click();
    cy.get('[data-testid="like-count"]').should('contain', '1');
  });

  it('should allow commenting on posts', () => {
    cy.get('[data-testid="comment-button"]').first().click();
    cy.get('textarea[name="comment"]').type('Looks amazing! Wish I was there!');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Looks amazing!').should('be.visible');
  });

  it('should display post images', () => {
    cy.get('[data-testid="post-image"]').should('be.visible');
  });

  it('should allow sharing posts', () => {
    cy.get('[data-testid="share-button"]').first().click();
    cy.contains('Share Post').should('be.visible');
  });
});

describe('Expense Management', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPassword123!');
    cy.visit('/trips/test-trip-id/expenses');
  });

  it('should display expense list', () => {
    cy.contains('Expenses').should('be.visible');
    cy.contains('Add Expense').should('be.visible');
    cy.contains('Total Spent').should('be.visible');
  });

  it('should categorize expenses correctly', () => {
    cy.contains('Accommodation').should('be.visible');
    cy.contains('Food').should('be.visible');
    cy.contains('Transport').should('be.visible');
    cy.contains('Activities').should('be.visible');
  });

  it('should allow expense categorization', () => {
    cy.contains('Add Expense').click();
    
    cy.get('select[name="category"]').select('food');
    cy.get('input[name="amount"]').type('25.50');
    cy.get('input[name="description"]').type('Lunch at local cafe');
    cy.get('input[name="date"]').type('2024-06-15');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('Food').should('be.visible');
    cy.contains('$25.50').should('be.visible');
  });

  it('should allow splitting expenses', () => {
    cy.contains('Add Expense').click();
    
    cy.get('select[name="category"]').select('accommodation');
    cy.get('input[name="amount"]').type('200.00');
    cy.get('input[name="description"]').type('Hotel room (split)');
    cy.get('select[name="paidBy"]').select('split_equally');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('Split Equally').should('be.visible');
  });

  it('should show expense receipts', () => {
    cy.get('[data-testid="receipt-button"]').first().click();
    cy.contains('Receipt').should('be.visible');
  });
});

describe('Itinerary Management', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPassword123!');
    cy.visit('/trips/test-trip-id/itinerary');
  });

  it('should display itinerary timeline', () => {
    cy.contains('Itinerary').should('be.visible');
    cy.contains('Timeline').should('be.visible');
    cy.contains('Add Item').should('be.visible');
  });

  it('should allow adding different types of itinerary items', () => {
    cy.contains('Add Item').click();
    
    // Test accommodation
    cy.get('select[name="type"]').select('accommodation');
    cy.get('input[name="title"]').type('Hotel Check-in');
    cy.get('input[name="startTime"]').type('2024-06-15T14:00');
    cy.get('input[name="location"]').type('Hotel Paris');
    cy.get('input[name="cost"]').type('150.00');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('Hotel Check-in').should('be.visible');
    
    // Test activity
    cy.contains('Add Item').click();
    cy.get('select[name="type"]').select('activity');
    cy.get('input[name="title"]').type('City Tour');
    cy.get('input[name="startTime"]').type('2024-06-15T15:00');
    cy.get('input[name="endTime"]').type('2024-06-15T18:00');
    cy.get('input[name="location"]').type('City Center');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('City Tour').should('be.visible');
  });

  it('should allow reordering itinerary items', () => {
    cy.get('[data-testid="itinerary-item"]').first().as('firstItem');
    cy.get('[data-testid="itinerary-item"]').last().as('lastItem');
    
    cy.get('@firstItem').find('[data-testid="drag-handle"]').trigger('mousedown');
    cy.get('@lastItem').trigger('mousemove');
    cy.get('@lastItem').trigger('mouseup');
    
    // Verify order changed (this would need proper drag-drop implementation)
    cy.get('[data-testid="itinerary-item"]').first().should('contain', 'City Tour');
  });

  it('should allow marking items as completed', () => {
    cy.get('[data-testid="complete-checkbox"]').first().click();
    cy.get('[data-testid="itinerary-item"]').first().should('have.class', 'completed');
  });

  it('should allow adding attachments to itinerary items', () => {
    cy.get('[data-testid="itinerary-item"]').first().find('[data-testid="add-attachment"]').click();
    cy.get('input[type="file"]').attachFile('test-image.jpg');
    cy.get('button[type="submit"]').click();
    
    cy.get('[data-testid="attachment"]').should('be.visible');
  });
});

describe('Search and Discovery', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPassword123!');
  });

  it('should allow searching for users', () => {
    cy.visit('/explore');
    cy.get('input[name="search"]').type('john');
    cy.contains('Search').click();
    
    cy.contains('Search Results').should('be.visible');
  });

  it('should allow searching for trips', () => {
    cy.visit('/explore/trips');
    cy.get('input[name="destination"]').type('Paris');
    cy.get('input[name="dates"]').type('2024-06-01 to 2024-06-30');
    cy.contains('Search').click();
    
    cy.contains('Trips in Paris').should('be.visible');
  });

  it('should display user profiles', () => {
    cy.visit('/users/john-doe');
    cy.contains('John Doe').should('be.visible');
    cy.contains('Profile').should('be.visible');
    cy.contains('Trips').should('be.visible');
    cy.contains('Posts').should('be.visible');
  });

  it('should allow following other users', () => {
    cy.visit('/users/john-doe');
    cy.contains('Follow').click();
    cy.contains('Following').should('be.visible');
  });
});