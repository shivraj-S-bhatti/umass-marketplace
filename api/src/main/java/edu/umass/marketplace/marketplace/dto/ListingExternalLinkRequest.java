package edu.umass.marketplace.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ListingExternalLinkRequest {

    @NotBlank(message = "Link label is required")
    @Size(max = 80, message = "Link label must not exceed 80 characters")
    private String label;

    @NotBlank(message = "Link URL is required")
    @Size(max = 2000, message = "Link URL must not exceed 2000 characters")
    private String url;

    @Size(max = 32, message = "Link type must not exceed 32 characters")
    private String type;
}
