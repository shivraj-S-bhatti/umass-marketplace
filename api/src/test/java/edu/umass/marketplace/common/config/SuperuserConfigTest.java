package edu.umass.marketplace.common.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class SuperuserConfigTest {

    private SuperuserConfig superuserConfig;

    @BeforeEach
    void setUp() {
        superuserConfig = new SuperuserConfig();
    }

    @Test
    void isSuperuser_returnsTrue_whenEmailMatchesConfigured() {
        ReflectionTestUtils.setField(superuserConfig, "configuredEmail", "test-superuser@umass.edu");

        assertThat(superuserConfig.isSuperuser("test-superuser@umass.edu")).isTrue();
    }

    @Test
    void isSuperuser_returnsTrue_whenEmailMatchesConfiguredCaseInsensitive() {
        ReflectionTestUtils.setField(superuserConfig, "configuredEmail", "test-superuser@umass.edu");

        assertThat(superuserConfig.isSuperuser("Test-Superuser@umass.edu")).isTrue();
    }

    @Test
    void isSuperuser_returnsFalse_whenEmailDoesNotMatch() {
        ReflectionTestUtils.setField(superuserConfig, "configuredEmail", "test-superuser@umass.edu");

        assertThat(superuserConfig.isSuperuser("other@umass.edu")).isFalse();
    }

    @Test
    void isSuperuser_returnsFalse_whenConfiguredEmailIsBlank() {
        ReflectionTestUtils.setField(superuserConfig, "configuredEmail", "");

        assertThat(superuserConfig.isSuperuser("test-superuser@umass.edu")).isFalse();
    }

    @Test
    void isSuperuser_returnsFalse_whenConfiguredEmailIsNull() {
        ReflectionTestUtils.setField(superuserConfig, "configuredEmail", null);

        assertThat(superuserConfig.isSuperuser("test-superuser@umass.edu")).isFalse();
    }

    @Test
    void isSuperuser_returnsFalse_whenEmailIsNull() {
        ReflectionTestUtils.setField(superuserConfig, "configuredEmail", "test-superuser@umass.edu");

        assertThat(superuserConfig.isSuperuser(null)).isFalse();
    }
}
