package edu.umass.marketplace.marketplace.response;

import edu.umass.marketplace.marketplace.model.ListingExternalLink;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingExternalLinkResponse {

    private UUID id;
    private String label;
    private String url;
    private String type;

    public static ListingExternalLinkResponse fromEntity(ListingExternalLink link) {
        return ListingExternalLinkResponse.builder()
                .id(link.getId())
                .label(link.getLabel())
                .url(link.getUrl())
                .type(link.getType())
                .build();
    }
}
