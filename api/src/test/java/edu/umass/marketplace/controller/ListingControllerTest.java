package edu.umass.marketplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.umass.marketplace.dto.CreateListingRequest;
import edu.umass.marketplace.response.ListingResponse;
import edu.umass.marketplace.response.StatsResponse;
import edu.umass.marketplace.service.ListingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ListingController.class,
            excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
class ListingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ListingService listingService;

    @Autowired
    private ObjectMapper objectMapper;

    private ListingResponse testListingResponse;
    private CreateListingRequest testCreateRequest;
    private UUID testListingId;

    @BeforeEach
    void setUp() {
        testListingId = UUID.randomUUID();
        UUID testSellerId = UUID.randomUUID();

        testListingResponse = ListingResponse.builder()
                .id(testListingId)
                .title("Test Laptop")
                .description("Great condition laptop")
                .price(BigDecimal.valueOf(500.00))
                .category("Electronics")
                .condition("Like New")
                .imageUrl(null)
                .status("ACTIVE")
                .sellerName("Test User")
                .createdAt(OffsetDateTime.now())
                .build();

        testCreateRequest = new CreateListingRequest();
        testCreateRequest.setTitle("Test Laptop");
        testCreateRequest.setDescription("Great condition laptop");
        testCreateRequest.setPrice(BigDecimal.valueOf(500.00));
        testCreateRequest.setCategory("Electronics");
        testCreateRequest.setCondition("Like New");
    }

    @Test
    void shouldGetListings() throws Exception {
        // Given
        Page<ListingResponse> page = new PageImpl<>(List.of(testListingResponse));
        when(listingService.getListings(anyString(), anyString(), anyString(), anyString(),
                any(Double.class), any(Double.class), anyInt(), anyInt()))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/listings"))
                .andExpect(status().isOk());

        verify(listingService, times(1)).getListings(
                eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(0), eq(20));
    }

    @Test
    void shouldGetListingsWithFilters() throws Exception {
        // Given
        Page<ListingResponse> page = new PageImpl<>(List.of(testListingResponse));
        when(listingService.getListings(anyString(), anyString(), anyString(), anyString(),
                any(Double.class), any(Double.class), anyInt(), anyInt()))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/listings")
                        .param("q", "laptop")
                        .param("category", "Electronics")
                        .param("minPrice", "100")
                        .param("maxPrice", "1000"))
                .andExpect(status().isOk());

        verify(listingService, times(1)).getListings(
                eq("laptop"), eq("Electronics"), eq(null), eq(null), eq(100.0), eq(1000.0), eq(0), eq(20));
    }

    @Test
    void shouldGetListingById() throws Exception {
        // Given
        when(listingService.getListingById(testListingId)).thenReturn(testListingResponse);

        // When & Then
        mockMvc.perform(get("/api/listings/{id}", testListingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testListingId.toString()))
                .andExpect(jsonPath("$.title").value("Test Laptop"))
                .andExpect(jsonPath("$.price").value(500.00));

        verify(listingService, times(1)).getListingById(testListingId);
    }

    @Test
    void shouldCreateListing() throws Exception {
        // Given
        when(listingService.createListing(any(CreateListingRequest.class)))
                .thenReturn(testListingResponse);

        // When & Then
        mockMvc.perform(post("/api/listings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testCreateRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(testListingId.toString()))
                .andExpect(jsonPath("$.title").value("Test Laptop"));

        verify(listingService, times(1)).createListing(any(CreateListingRequest.class));
    }

    @Test
    void shouldRejectInvalidCreateRequest() throws Exception {
        // Given - Create invalid request
        CreateListingRequest invalidRequest = new CreateListingRequest();
        invalidRequest.setTitle(""); // Invalid: empty title

        // When & Then
        mockMvc.perform(post("/api/listings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldCreateBulkListings() throws Exception {
        // Given
        List<CreateListingRequest> requests = List.of(testCreateRequest);
        when(listingService.createListingsBulk(anyList()))
                .thenReturn(List.of(testListingResponse));

        // When & Then
        mockMvc.perform(post("/api/listings/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requests)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Test Laptop"));

        verify(listingService, times(1)).createListingsBulk(anyList());
    }

    @Test
    void shouldUpdateListing() throws Exception {
        // Given
        when(listingService.updateListing(any(UUID.class), any(CreateListingRequest.class)))
                .thenReturn(testListingResponse);

        // When & Then
        mockMvc.perform(put("/api/listings/{id}", testListingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testCreateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Laptop"));

        verify(listingService, times(1)).updateListing(testListingId, testCreateRequest);
    }

    @Test
    void shouldDeleteListing() throws Exception {
        // Given
        doNothing().when(listingService).deleteListing(testListingId);

        // When & Then
        mockMvc.perform(delete("/api/listings/{id}", testListingId))
                .andExpect(status().isNoContent());

        verify(listingService, times(1)).deleteListing(testListingId);
    }

    @Test
    void shouldGetListingsBySeller() throws Exception {
        // Given
        UUID sellerId = UUID.randomUUID();
        Page<ListingResponse> page = new PageImpl<>(List.of(testListingResponse));
        when(listingService.getListingsBySeller(sellerId, 0, 10))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/listings/seller/{sellerId}", sellerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        verify(listingService, times(1)).getListingsBySeller(sellerId, 0, 10);
    }

    @Test
    void shouldGetListingStats() throws Exception {
        // Given
        StatsResponse stats = new StatsResponse(10L, 5L, 2L);
        when(listingService.getListingStats()).thenReturn(stats);

        // When & Then
        mockMvc.perform(get("/api/listings/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeListings").value(10))
                .andExpect(jsonPath("$.soldListings").value(5))
                .andExpect(jsonPath("$.onHoldListings").value(2));

        verify(listingService, times(1)).getListingStats();
    }
}

