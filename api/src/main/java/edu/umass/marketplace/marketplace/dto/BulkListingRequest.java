package edu.umass.marketplace.marketplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.util.List;

@Data
@Schema(description = "Bulk listing request wrapper")
public class BulkListingRequest {
    @Schema(description = "List of listings to create")
    private List<CreateListingRequest> listings;
}
