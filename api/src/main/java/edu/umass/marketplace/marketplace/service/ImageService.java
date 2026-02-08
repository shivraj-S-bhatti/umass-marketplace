package edu.umass.marketplace.marketplace.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

/**
 * Service for handling image compression and S3 storage.
 * Compresses images to reduce storage costs and improve performance.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name:umass-marketplace-images}")
    private String bucketName;

    @Value("${aws.s3.region:us-east-1}")
    private String region;

    @Value("${aws.s3.enabled:false}")
    private boolean s3Enabled;

    @Value("${image.compression.max-width:800}")
    private int maxWidth;

    @Value("${image.compression.max-height:800}")
    private int maxHeight;

    @Value("${image.compression.quality:0.6}")
    private double quality;

    @Value("${image.compression.max-size-kb:40}")
    private int maxSizeKB;

    /**
     * Compress and upload image to S3.
     * If S3 is disabled, returns the compressed base64 string (fallback mode).
     *
     * @param base64Image Base64 encoded image data URL (e.g., "data:image/jpeg;base64,...")
     * @param listingId   Listing ID for organizing images
     * @return S3 URL if S3 enabled, compressed base64 string otherwise
     */
    public String compressAndUpload(String base64Image, UUID listingId) {
        if (base64Image == null || base64Image.trim().isEmpty()) {
            return null;
        }

        try {
            // Extract image data from data URL
            String imageData = extractBase64Data(base64Image);
            byte[] imageBytes = Base64.getDecoder().decode(imageData);

            // Compress image
            byte[] compressedBytes = compressImage(imageBytes);

            if (s3Enabled) {
                // Upload to S3
                String s3Key = generateS3Key(listingId);
                uploadToS3(compressedBytes, s3Key);
                String s3Url = generateS3Url(s3Key);
                log.debug("Uploaded compressed image to S3: {}", s3Url);
                return s3Url;
            } else {
                // Fallback: return compressed base64
                String compressedBase64 = Base64.getEncoder().encodeToString(compressedBytes);
                return "data:image/jpeg;base64," + compressedBase64;
            }
        } catch (Exception e) {
            log.error("Error compressing/uploading image: {}", e.getMessage(), e);
            // Return original if compression fails
            return base64Image;
        }
    }

    /**
     * Compress image bytes using Thumbnailator.
     * Reduces dimensions and quality to meet size requirements.
     */
    private byte[] compressImage(byte[] imageBytes) throws IOException {
        BufferedImage originalImage = ImageIO.read(new java.io.ByteArrayInputStream(imageBytes));

        if (originalImage == null) {
            throw new IOException("Unable to read image");
        }

        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        // Calculate target dimensions maintaining aspect ratio
        double scale = Math.min(
            (double) maxWidth / width,
            (double) maxHeight / height
        );
        scale = Math.min(scale, 1.0); // Don't upscale

        int targetWidth = (int) (width * scale);
        int targetHeight = (int) (height * scale);

        // Compress with iterative quality reduction if needed
        double currentQuality = quality;
        byte[] compressed = null;
        int attempts = 0;
        int maxAttempts = 5;

        while (attempts < maxAttempts) {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Thumbnails.of(originalImage)
                .size(targetWidth, targetHeight)
                .outputFormat("jpg")
                .outputQuality(currentQuality)
                .toOutputStream(outputStream);

            compressed = outputStream.toByteArray();
            int sizeKB = compressed.length / 1024;

            if (sizeKB <= maxSizeKB || currentQuality <= 0.3) {
                log.debug("Compressed image: {}x{} -> {}x{}, quality: {}, size: {}KB",
                    width, height, targetWidth, targetHeight, currentQuality, sizeKB);
                break;
            }

            // Reduce quality further
            currentQuality -= 0.15;
            attempts++;
        }

        if (compressed == null) {
            throw new IOException("Failed to compress image");
        }

        return compressed;
    }

    /**
     * Upload compressed image to S3.
     */
    private void uploadToS3(byte[] imageBytes, String s3Key) {
        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType("image/jpeg")
                .cacheControl("max-age=31536000") // 1 year cache
                .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(imageBytes));
            log.debug("Uploaded image to S3: {}", s3Key);
        } catch (Exception e) {
            log.error("Error uploading to S3: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload image to S3", e);
        }
    }

    /**
     * Delete image from S3.
     */
    public void deleteImage(String s3Url) {
        if (!s3Enabled || s3Url == null || !s3Url.startsWith("https://")) {
            return;
        }

        try {
            String s3Key = extractS3Key(s3Url);
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

            s3Client.deleteObject(deleteRequest);
            log.debug("Deleted image from S3: {}", s3Key);
        } catch (Exception e) {
            log.error("Error deleting image from S3: {}", e.getMessage(), e);
        }
    }

    /**
     * Generate S3 key for image storage.
     */
    private String generateS3Key(UUID listingId) {
        return String.format("listings/%s/%s.jpg", listingId, UUID.randomUUID());
    }

    /**
     * Generate S3 URL from key.
     */
    private String generateS3Url(String s3Key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, s3Key);
    }

    /**
     * Extract S3 key from URL.
     */
    private String extractS3Key(String s3Url) {
        // Extract key from URL like: https://bucket.s3.region.amazonaws.com/key
        String prefix = String.format("https://%s.s3.%s.amazonaws.com/", bucketName, region);
        if (s3Url.startsWith(prefix)) {
            return s3Url.substring(prefix.length());
        }
        throw new IllegalArgumentException("Invalid S3 URL format: " + s3Url);
    }

    /**
     * Extract base64 data from data URL.
     */
    private String extractBase64Data(String dataUrl) {
        if (dataUrl.startsWith("data:image")) {
            int commaIndex = dataUrl.indexOf(',');
            if (commaIndex != -1) {
                return dataUrl.substring(commaIndex + 1);
            }
        }
        return dataUrl; // Assume it's already base64
    }
}
