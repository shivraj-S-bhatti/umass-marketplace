package edu.umass.marketplace.integration;

// Integration Test for Listing Repository using Testcontainers
// Tests CRUD operations against a real PostgreSQL database in a container
import edu.umass.marketplace.model.Condition;
import edu.umass.marketplace.model.Listing;
import edu.umass.marketplace.model.User;
import edu.umass.marketplace.repository.ListingRepository;
import edu.umass.marketplace.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class ListingRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("umarket_test")
            .withUsername("umarket_test")
            .withPassword("umarket_test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    private User testSeller;

    @BeforeEach
    void setUp() {
        // Create a test seller
        testSeller = new User();
        testSeller.setEmail("test@umass.edu");
        testSeller.setName("Test User");
        testSeller = userRepository.save(testSeller);
    }

    @Test
    void shouldCreateAndFindListing() {
        // Given
        Listing listing = new Listing();
        listing.setTitle("Test Laptop");
        listing.setDescription("Great condition laptop");
        listing.setPrice(new BigDecimal("500.00"));
        listing.setCategory("Electronics");
        listing.setCondition(Condition.GOOD);
        listing.setSeller(testSeller);

        // When
        Listing savedListing = listingRepository.save(listing);

        // Then
        assertThat(savedListing.getId()).isNotNull();
        assertThat(savedListing.getTitle()).isEqualTo("Test Laptop");
        assertThat(savedListing.getPrice()).isEqualTo(new BigDecimal("500.00"));
        assertThat(savedListing.getStatus()).isEqualTo(Listing.STATUS_ACTIVE);
    }

    @Test
    void shouldFindListingsBySeller() {
        // Given
        Listing listing1 = createTestListing("Laptop", "500.00");
        Listing listing2 = createTestListing("Phone", "300.00");
        listingRepository.saveAll(List.of(listing1, listing2));

        // When
        List<Listing> sellerListings = listingRepository.findBySellerId(testSeller.getId(),
                org.springframework.data.domain.PageRequest.of(0, 10)).getContent();

        // Then
        assertThat(sellerListings).hasSize(2);
        assertThat(sellerListings).extracting(Listing::getTitle)
                .containsExactlyInAnyOrder("Laptop", "Phone");
    }

    @Test
    void shouldFindListingsByStatus() {
        // Given
        Listing activeListing = createTestListing("Active Item", "100.00");
        Listing soldListing = createTestListing("Sold Item", "200.00");
        soldListing.setStatus(Listing.STATUS_SOLD);
        listingRepository.saveAll(List.of(activeListing, soldListing));

        // When
        List<Listing> activeListings = listingRepository.findByStatus(Listing.STATUS_ACTIVE,
                org.springframework.data.domain.PageRequest.of(0, 10)).getContent();

        // Then
        assertThat(activeListings).hasSize(1);
        assertThat(activeListings.get(0).getTitle()).isEqualTo("Active Item");
    }

    private Listing createTestListing(String title, String price) {
        Listing listing = new Listing();
        listing.setTitle(title);
        listing.setDescription("Test description");
        listing.setPrice(new BigDecimal(price));
        listing.setCategory("Test");
        listing.setCondition(Condition.GOOD);
        listing.setSeller(testSeller);
        return listing;
    }
}
