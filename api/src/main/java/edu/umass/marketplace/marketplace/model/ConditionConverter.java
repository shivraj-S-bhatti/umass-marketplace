package edu.umass.marketplace.marketplace.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

// Condition Converter - handles conversion between Condition enum and database strings
// Converts enum display names (e.g., "Like New") to/from enum values
@Converter
public class ConditionConverter implements AttributeConverter<Condition, String> {

    @Override
    public String convertToDatabaseColumn(Condition condition) {
        if (condition == null) {
            return null;
        }
        return condition.getDisplayName();
    }

    @Override
    public Condition convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        
        // First try to match by display name (e.g., "Like New")
        Condition condition = Condition.fromDisplayName(dbData);
        if (condition != null) {
            return condition;
        }
        
        // If not found, try to match by enum name (e.g., "LIKE_NEW")
        // This handles legacy data stored with enum names
        try {
            return Condition.valueOf(dbData.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            // If neither works, return null
            return null;
        }
    }
}

