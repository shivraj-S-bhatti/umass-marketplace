package edu.umass.marketplace.marketplace.model;

// Condition Enum - represents the condition/quality of a marketplace item
// Maps to string values in the database
public enum Condition {
    NEW("New"),
    LIKE_NEW("Like New"),
    GOOD("Good"),
    FAIR("Fair"),
    DOES_THE_JOB("Does the job!");

    private final String displayName;

    Condition(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    // Find enum by display name (for API requests)
    public static Condition fromDisplayName(String displayName) {
        if (displayName == null || displayName.trim().isEmpty()) {
            return null;
        }
        for (Condition condition : values()) {
            if (condition.displayName.equalsIgnoreCase(displayName.trim())) {
                return condition;
            }
        }
        return null;
    }
}

