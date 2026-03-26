package edu.umass.marketplace.marketplace.model;

// Listing Entity - represents a marketplace item for sale
// Maps to the listings table with JPA annotations and enum for status
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "category")
    private String category;

    @Convert(converter = ConditionConverter.class)
    @Column(name = "condition")
    private Condition condition;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "kind", nullable = false, length = 24)
    private String kind = "MARKETPLACE";

    @Column(name = "lease_arrangement", length = 32)
    private String leaseArrangement;

    @Column(name = "transfer_scope", length = 32)
    private String transferScope;

    @Column(name = "space_type", length = 32)
    private String spaceType;

    @Column(name = "property_name", length = 255)
    private String propertyName;

    @Column(name = "area_label", length = 255)
    private String areaLabel;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Column(name = "lease_end")
    private LocalDate leaseEnd;

    @Column(name = "bedrooms")
    private Integer bedrooms;

    @Column(name = "bathrooms", precision = 4, scale = 1)
    private BigDecimal bathrooms;

    @Column(name = "nearest_bus_stop_name", length = 255)
    private String nearestBusStopName;

    @Column(name = "nearest_bus_stop_walk_minutes")
    private Integer nearestBusStopWalkMinutes;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "bus_routes_json", columnDefinition = "TEXT")
    private List<String> busRoutes = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "included_utilities_json", columnDefinition = "TEXT")
    private List<String> includedUtilities = new ArrayList<>();

    @Column(name = "estimated_utilities_monthly_total", precision = 10, scale = 2)
    private BigDecimal estimatedUtilitiesMonthlyTotal;

    @Column(name = "electricity_estimate", precision = 10, scale = 2)
    private BigDecimal electricityEstimate;

    @Column(name = "gas_estimate", precision = 10, scale = 2)
    private BigDecimal gasEstimate;

    @Column(name = "water_estimate", precision = 10, scale = 2)
    private BigDecimal waterEstimate;

    @Column(name = "internet_estimate", precision = 10, scale = 2)
    private BigDecimal internetEstimate;

    @Column(name = "laundry_type", length = 32)
    private String laundryType;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "amenities_json", columnDefinition = "TEXT")
    private List<String> amenities = new ArrayList<>();

    @Column(name = "cleaning_notes", columnDefinition = "TEXT")
    private String cleaningNotes;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "must_go_by")
    private OffsetDateTime mustGoBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @jakarta.persistence.OrderBy("sortOrder ASC")
    private List<ListingImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @jakarta.persistence.OrderBy("sortOrder ASC")
    private List<ListingExternalLink> externalLinks = new ArrayList<>();

    // Constants for listing status
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_ON_HOLD = "ON_HOLD";
    public static final String STATUS_SOLD = "SOLD";

    public static final String KIND_MARKETPLACE = "MARKETPLACE";
    public static final String KIND_LEASING = "LEASING";
}
