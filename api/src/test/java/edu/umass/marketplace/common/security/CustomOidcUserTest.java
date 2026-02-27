package edu.umass.marketplace.common.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CustomOidcUserTest {

    @Test
    void getAuthorities_containsRoleAdmin_whenConstructedWithRoleAdmin() {
        OidcUser delegate = mock(OidcUser.class);
        UUID id = UUID.randomUUID();
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );

        CustomOidcUser user = new CustomOidcUser(
                delegate, id, "test-superuser@umass.edu", "Test Superuser", null, authorities);

        Collection<?> result = user.getAuthorities();
        List<String> authorityStrings = result.stream()
                .map(a -> a.toString())
                .collect(Collectors.toList());

        assertThat(authorityStrings).contains("ROLE_ADMIN");
        assertThat(authorityStrings).contains("ROLE_USER");
    }

    @Test
    void getAuthorities_containsOnlyRoleUser_whenConstructedWithoutRoleAdmin() {
        OidcUser delegate = mock(OidcUser.class);
        UUID id = UUID.randomUUID();
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_USER")
        );

        CustomOidcUser user = new CustomOidcUser(
                delegate, id, "other@umass.edu", "Other User", null, authorities);

        Collection<?> result = user.getAuthorities();
        List<String> authorityStrings = result.stream()
                .map(a -> a.toString())
                .collect(Collectors.toList());

        assertThat(authorityStrings).containsExactly("ROLE_USER");
    }
}
