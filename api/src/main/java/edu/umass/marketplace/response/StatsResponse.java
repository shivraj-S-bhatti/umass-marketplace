package edu.umass.marketplace.response;

// Stats Response - represents marketplace statistics
// Provides count of listings by status
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private long activeListings;
    private long soldListings;
    private long onHoldListings;
}

