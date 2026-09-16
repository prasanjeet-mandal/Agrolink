package com.agrolink.service.impl;

import com.agrolink.config.GoogleConfig;
import com.agrolink.dto.auth.GoogleAuthResponse;
import com.agrolink.dto.auth.GoogleLoginRequest;
import com.agrolink.dto.auth.GoogleSignupRequest;
import com.agrolink.entity.User;
import com.agrolink.enums.AuthProvider;
import com.agrolink.enums.Role;
import com.agrolink.exception.BadRequestException;
import com.agrolink.repository.DeliveryPartnerProfileRepository;
import com.agrolink.repository.UserRepository;
import com.agrolink.security.GoogleIdTokenVerifier;
import com.agrolink.security.GoogleTokenExchanger;
import com.agrolink.security.JwtService;
import com.agrolink.security.SecurityUser;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleAuthServiceImplTest {

    private static final String CLIENT_ID = "test-client-id";
    private static final String GOOGLE_SUB = "g-sub-123";
    private static final String EMAIL = "alice@example.com";
    private static final String NAME = "Alice";
    private static final String CODE = "auth-code";
    private static final String ID_TOKEN = "id-token-jwt";

    @Mock
    private UserRepository userRepository;
    @Mock
    private DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordEncoder passwordEncoder;

    private FakeGoogleConfig config;
    private FakeTokenExchanger exchanger;
    private FakeTokenVerifier verifier;
    private GoogleAuthServiceImpl service;

    @BeforeEach
    void setUp() {
        config = new FakeGoogleConfig(CLIENT_ID, "secret");
        exchanger = new FakeTokenExchanger(ID_TOKEN);
        verifier = new FakeTokenVerifier(CLIENT_ID);
        service = new GoogleAuthServiceImpl(config, exchanger, verifier, userRepository, deliveryPartnerProfileRepository, jwtService, passwordEncoder);

        lenient().when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(passwordEncoder.encode(any())).thenReturn("encoded-random-password");
    }

    @Test
    void googleLogin_existingGoogleUser_returnsToken() {

        User existing = new User();
        existing.setId(42L);
        existing.setFullName(NAME);
        existing.setEmail(EMAIL);
        existing.setRole(Role.CONSUMER);
        existing.setAuthProvider(AuthProvider.GOOGLE);
        existing.setGoogleId(GOOGLE_SUB);

        when(userRepository.findByGoogleId(GOOGLE_SUB))
                .thenReturn(Optional.of(existing));
        when(jwtService.generateToken(any(SecurityUser.class)))
                .thenReturn("jwt-token");

        GoogleAuthResponse res =
                service.googleLogin(new GoogleLoginRequest(CODE, null, null, null));

        assertFalse(res.needsRole());
        assertEquals("jwt-token", res.token());
        assertEquals(42L, res.userId());
        assertEquals(Role.CONSUMER.name(), res.role());
        verify(userRepository, never()).save(any());
    }

    @Test
    void googleLogin_existingLocalUser_linksGoogle() {

        User existing = new User();
        existing.setId(7L);
        existing.setFullName("Bob");
        existing.setEmail(EMAIL);
        existing.setRole(Role.FARMER);
        existing.setAuthProvider(AuthProvider.LOCAL);
        existing.setPhone("");

        when(userRepository.findByGoogleId(GOOGLE_SUB))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.of(existing));
        when(jwtService.generateToken(any(SecurityUser.class)))
                .thenReturn("jwt-token");

        GoogleAuthResponse res =
                service.googleLogin(new GoogleLoginRequest(CODE, null, null, null));

        assertFalse(res.needsRole());
        assertEquals(7L, res.userId());
        verify(userRepository).save(existing);
        assertEquals(AuthProvider.GOOGLE, existing.getAuthProvider());
        assertEquals(GOOGLE_SUB, existing.getGoogleId());
        assertTrue(existing.isEnabled());
    }

    @Test
    void googleLogin_newUser_returnsSignupTicket() {

        when(userRepository.findByGoogleId(GOOGLE_SUB))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.empty());
        when(jwtService.generateGoogleSignupTicket(EMAIL, GOOGLE_SUB, NAME, true))
                .thenReturn("signup-ticket");

        GoogleAuthResponse res =
                service.googleLogin(new GoogleLoginRequest(CODE, null, null, null));

        assertTrue(res.needsRole());
        assertEquals("signup-ticket", res.signupTicket());
        assertNull(res.token());
        assertNull(res.role());
        assertEquals(EMAIL, res.email());
        verify(userRepository, never()).save(any());
    }

    @Test
    void googleLogin_unverifiedEmail_throws() {

        verifier.emailVerified = false;

        when(userRepository.findByGoogleId(GOOGLE_SUB))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> service.googleLogin(new GoogleLoginRequest(CODE, null, null, null))
        );
        assertTrue(ex.getMessage().toLowerCase().contains("not verified"));
    }

    @Test
    void googleLogin_notConfigured_throws() {

        config.clientId = "";
        config.clientSecret = "";

        assertThrows(BadRequestException.class,
                () -> service.googleLogin(new GoogleLoginRequest(CODE, null, null, null))
        );
    }

    @Test
    void googleLogin_emailLinkedToDifferentGoogleAccount_throws() {

        User other = new User();
        other.setId(100L);
        other.setEmail(EMAIL);
        other.setAuthProvider(AuthProvider.GOOGLE);
        other.setGoogleId("different-google-sub");

        when(userRepository.findByGoogleId(GOOGLE_SUB))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.of(other));

        assertThrows(BadRequestException.class,
                () -> service.googleLogin(new GoogleLoginRequest(CODE, null, null, null))
        );
    }

    @Test
    void completeSignup_consumer_createsUser() {

        when(jwtService.verifyGoogleSignupTicket("ticket"))
                .thenReturn(new JwtService.GoogleSignupClaims(EMAIL, GOOGLE_SUB, NAME, true));
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(userRepository.existsByGoogleId(GOOGLE_SUB)).thenReturn(false);
        when(jwtService.generateToken(any(SecurityUser.class))).thenReturn("jwt");

        User saved = new User();
        saved.setId(99L);
        saved.setRole(Role.CONSUMER);
        when(userRepository.save(any(User.class))).thenReturn(saved);

        GoogleAuthResponse res = service.completeSignup(
                new GoogleSignupRequest("ticket", "CONSUMER", null, null)
        );

        assertFalse(res.needsRole());
        assertEquals(Role.CONSUMER.name(), res.role());
        assertNotNull(res.token());
        assertNotNull(res.userId());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("encoded-random-password", captor.getValue().getPassword());
        verify(deliveryPartnerProfileRepository, never()).save(any());
    }

    @Test
    void completeSignup_deliveryPartner_savesProfile() {

        when(jwtService.verifyGoogleSignupTicket("ticket"))
                .thenReturn(new JwtService.GoogleSignupClaims(EMAIL, GOOGLE_SUB, NAME, true));
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(userRepository.existsByGoogleId(GOOGLE_SUB)).thenReturn(false);
        when(jwtService.generateToken(any(SecurityUser.class))).thenReturn("jwt");

        User saved = new User();
        saved.setId(101L);
        saved.setRole(Role.DELIVERY_PARTNER);
        when(userRepository.save(any(User.class))).thenReturn(saved);

        service.completeSignup(
                new GoogleSignupRequest("ticket", "DELIVERY_PARTNER", "PB-10-AB-1234", "DL-042019-007654")
        );

        verify(deliveryPartnerProfileRepository).save(any());
    }

    @Test
    void completeSignup_deliveryPartner_missingFields_throws() {

        when(jwtService.verifyGoogleSignupTicket("ticket"))
                .thenReturn(new JwtService.GoogleSignupClaims(EMAIL, GOOGLE_SUB, NAME, true));

        assertThrows(BadRequestException.class,
                () -> service.completeSignup(new GoogleSignupRequest("ticket", "DELIVERY_PARTNER", "", ""))
        );
    }

    @Test
    void completeSignup_invalidRole_throws() {

        when(jwtService.verifyGoogleSignupTicket("ticket"))
                .thenReturn(new JwtService.GoogleSignupClaims(EMAIL, GOOGLE_SUB, NAME, true));

        assertThrows(BadRequestException.class,
                () -> service.completeSignup(new GoogleSignupRequest("ticket", "ADMIN", null, null))
        );
    }

    @Test
    void completeSignup_duplicateEmail_throws() {

        when(jwtService.verifyGoogleSignupTicket("ticket"))
                .thenReturn(new JwtService.GoogleSignupClaims(EMAIL, GOOGLE_SUB, NAME, true));
        when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

        assertThrows(BadRequestException.class,
                () -> service.completeSignup(new GoogleSignupRequest("ticket", "CONSUMER", null, null))
        );
    }

    @Test
    void completeSignup_duplicateGoogleId_throws() {

        when(jwtService.verifyGoogleSignupTicket("ticket"))
                .thenReturn(new JwtService.GoogleSignupClaims(EMAIL, GOOGLE_SUB, NAME, true));
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(userRepository.existsByGoogleId(GOOGLE_SUB)).thenReturn(true);

        assertThrows(BadRequestException.class,
                () -> service.completeSignup(new GoogleSignupRequest("ticket", "CONSUMER", null, null))
        );
    }

    @Test
    void completeSignup_emptyRole_throws() {

        when(jwtService.verifyGoogleSignupTicket("ticket"))
                .thenReturn(new JwtService.GoogleSignupClaims(EMAIL, GOOGLE_SUB, NAME, true));

        assertThrows(BadRequestException.class,
                () -> service.completeSignup(new GoogleSignupRequest("ticket", "", null, null))
        );
    }

    // ---------- Stubs ----------

    private static class FakeGoogleConfig extends GoogleConfig {
        private String clientId;
        private String clientSecret;

        FakeGoogleConfig(String clientId, String clientSecret) {
            this.clientId = clientId;
            this.clientSecret = clientSecret;
        }

        @Override
        public String getClientId() {
            return clientId;
        }

        @Override
        public String getClientSecret() {
            return clientSecret;
        }

        @Override
        public boolean isConfigured() {
            return !clientId.isBlank() && !clientSecret.isBlank();
        }
    }

    private static class FakeTokenExchanger implements GoogleTokenExchanger {
        private final String idToken;

        FakeTokenExchanger(String idToken) {
            this.idToken = idToken;
        }

        @Override
        public String exchangeForIdToken(String authorizationCode) {
            return idToken;
        }
    }

    private static class FakeTokenVerifier implements GoogleIdTokenVerifier {
        private final String clientId;
        boolean emailVerified = true;

        FakeTokenVerifier(String clientId) {
            this.clientId = clientId;
        }

        @Override
        public boolean isConfigured() {
            return true;
        }

        @Override
        public IdTokenInfo verify(String idToken) {
            return new IdTokenInfo(
                    GOOGLE_SUB,
                    EMAIL,
                    NAME,
                    emailVerified
            );
        }
    }
}