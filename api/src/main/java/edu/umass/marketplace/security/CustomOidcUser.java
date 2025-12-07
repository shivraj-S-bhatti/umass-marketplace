package edu.umass.marketplace.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

public class CustomOidcUser extends UserPrincipal implements OidcUser {
    
    private final OidcUser delegate;

    public CustomOidcUser(OidcUser delegate, UUID id, String email, String name, String pictureUrl,
                         Collection<? extends GrantedAuthority> authorities) {
        super(id, email, name, pictureUrl);
        this.delegate = delegate;
    }

    @Override
    public Map<String, Object> getClaims() {
        return delegate.getClaims();
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return delegate.getUserInfo();
    }

    @Override
    public OidcIdToken getIdToken() {
        return delegate.getIdToken();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public String getName() {
        return super.getName();
    }
}