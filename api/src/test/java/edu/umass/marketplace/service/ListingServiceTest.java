package edu.umass.marketplace.service;

import edu.umass.marketplace.dto.CreateListingRequest;
import edu.umass.marketplace.model.Condition;
import edu.umass.marketplace.model.Listing;
import edu.umass.marketplace.model.User;
import edu.umass.marketplace.repository.ListingRepository;
import edu.umass.marketplace.repository.UserRepository;
import edu.umass.marketplace.response.ListingResponse;
import edu.umass.marketplace.response.StatsResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListingServiceTest {

    @Mock
    private ListingRepository listingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ListingService listingService;

    private User testSeller;
    private Listing testListing;
    private CreateListingRequest testRequest;

    @BeforeEach
    void setUp() {
        // Mock Security Context
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        lenient().when(authentication.getPrincipal()).thenReturn("dummy@umass.edu");

        testSeller = new User();
        testSeller.setId(UUID.randomUUID());
        testSeller.setEmail("seller@umass.edu");
        testSeller.setName("Test Seller");

        testListing = new Listing();
        testListing.setId(UUID.randomUUID());
        testListing.setTitle("Test Laptop");
        testListing.setDescription("Great condition");
        testListing.setPrice(BigDecimal.valueOf(500.00));
        testListing.setCategory("Electronics");
        testListing.setCondition(Condition.LIKE_NEW);
        testListing.setStatus("ACTIVE");
        testListing.setSeller(testSeller);
        testListing.setCreatedAt(OffsetDateTime.now());
        testListing.setUpdatedAt(OffsetDateTime.now());

        testRequest = new CreateListingRequest();
        testRequest.setTitle("Test Laptop");
        testRequest.setDescription("Great condition");
        testRequest.setPrice(BigDecimal.valueOf(500.00));
        testRequest.setCategory("Electronics");
        testRequest.setCondition("Like New");
    }

    @Test
    void shouldGetListings() {
        // Given
        Page<Listing> page = new PageImpl<>(List.of(testListing));
        when(listingRepository.findAll(any(PageRequest.class))).thenReturn(page);

        // When
        Page<ListingResponse> result = listingService.getListings(
                null, null, null, null, null, null, 0, 20);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(listingRepository, times(1)).findAll(any(PageRequest.class));
    }

    @Test
    void shouldGetListingsWithFilters() {
        // Given
        Page<Listing> page = new PageImpl<>(List.of(testListing));
        when(listingRepository.findWithFilters(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        // When
        Page<ListingResponse> result = listingService.getListings(
                "laptop", "Electronics", "ACTIVE", "Like New", 100.0, 1000.0, 0, 20);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(listingRepository, times(1)).findWithFilters(
                eq("laptop"), eq("Electronics"), eq("ACTIVE"), any(), any(), any(), any());
    }

    @Test
    void shouldGetListingById() {
        // Given
        when(listingRepository.findById(testListing.getId()))
                .thenReturn(Optional.of(testListing));

        // When
        ListingResponse result = listingService.getListingById(testListing.getId());

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Laptop");
        assertThat(result.getPrice()).isEqualTo(BigDecimal.valueOf(500.00));
        verify(listingRepository, times(1)).findById(testListing.getId());
    }

    @Test
    void shouldThrowExceptionWhenListingNotFound() {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        when(listingRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> listingService.getListingById(nonExistentId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldCreateListing() {
        // Given
        when(userRepository.findByEmail("dummy@umass.edu")).thenReturn(Optional.of(testSeller));
        when(listingRepository.save(any(Listing.class))).thenReturn(testListing);

        // When
        ListingResponse result = listingService.createListing(testRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Laptop");
        verify(listingRepository, times(1)).save(any(Listing.class));
    }

    @Test
    void shouldCreateBulkListings() {
        // Given
        List<CreateListingRequest> requests = List.of(testRequest);
        when(userRepository.findByEmail("dummy@umass.edu")).thenReturn(Optional.of(testSeller));
        when(listingRepository.saveAll(anyList())).thenReturn(List.of(testListing));

        // When
        List<ListingResponse> result = listingService.createListingsBulk(requests);

        // Then
        assertThat(result).hasSize(1);
        verify(listingRepository, times(1)).saveAll(anyList());
    }

    @Test
    void shouldUpdateListing() {
        // Given
        when(listingRepository.findById(testListing.getId()))
                .thenReturn(Optional.of(testListing));
        when(listingRepository.save(any(Listing.class))).thenReturn(testListing);

        // When
        ListingResponse result = listingService.updateListing(testListing.getId(), testRequest);

        // Then
        assertThat(result).isNotNull();
        verify(listingRepository, times(1)).save(any(Listing.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentListing() {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        when(listingRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> listingService.updateListing(nonExistentId, testRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void shouldDeleteListing() {
        // Given
        when(listingRepository.existsById(testListing.getId())).thenReturn(true);
        doNothing().when(listingRepository).deleteById(testListing.getId());

        // When
        listingService.deleteListing(testListing.getId());

        // Then
        verify(listingRepository, times(1)).deleteById(testListing.getId());
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentListing() {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        when(listingRepository.existsById(nonExistentId)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> listingService.deleteListing(nonExistentId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

//    @Test
//    void shouldGetListingsBySeller() {
//        // Given
//        Page<Listing> page = new PageImpl<>(List.of(testListing));
//        when(listingRepository.findBySellerId(any(), any())).thenReturn(page);
//
//        // When
//        Page<ListingResponse> result = listingService.getListingsBySeller(testSeller.getId(), 0, 10);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.getContent()).hasSize(1);
//        verify(listingRepository, times(1)).findBySellerId(testSeller.getId(), any());
//    }

    @Test
    void shouldGetListingStats() {
        // Given
        when(listingRepository.countByStatus("ACTIVE")).thenReturn(10L);
        when(listingRepository.countByStatus("SOLD")).thenReturn(5L);
        when(listingRepository.countByStatus("ON_HOLD")).thenReturn(2L);

        // When
        StatsResponse result = listingService.getListingStats();

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getActiveListings()).isEqualTo(10L);
        assertThat(result.getSoldListings()).isEqualTo(5L);
        assertThat(result.getOnHoldListings()).isEqualTo(2L);
        verify(listingRepository, times(1)).countByStatus("ACTIVE");
        verify(listingRepository, times(1)).countByStatus("SOLD");
        verify(listingRepository, times(1)).countByStatus("ON_HOLD");
    }
}

