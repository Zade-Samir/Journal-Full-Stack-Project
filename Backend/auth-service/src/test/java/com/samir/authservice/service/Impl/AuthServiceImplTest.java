package com.samir.authservice.service.Impl;

import com.samir.authservice.dto.AuthRequest;
import com.samir.authservice.dto.AuthResponse;
import com.samir.authservice.entity.User;
import com.samir.authservice.repo.UserRepo;
import com.samir.authservice.service.EmailService;
import com.samir.authservice.util.JwtUtil;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceImplTest {

    @Mock
    private UserRepo repo;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLogin_Success() {
        AuthRequest request = new AuthRequest();
        request.setEmail("user@example.com");
        request.setPassword("password");

        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword("encoded_password");
        user.setRole("USER");
        user.setVerified(true);

        when(repo.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user.getEmail(), user.getRole())).thenReturn("jwt_token");

        AuthResponse response = service.login(request);

        assertNotNull(response);
        assertEquals("jwt_token", response.getToken());
        verify(repo).findByEmail(request.getEmail());
    }

    @Test
    void testLogin_UserNotFound() {
        AuthRequest request = new AuthRequest();
        request.setEmail("unknown@example.com");
        request.setPassword("password");

        when(repo.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.login(request));
        assertTrue(exception.getMessage().contains("User not found"));
    }

    @Test
    void testLogin_InvalidPassword() {
        AuthRequest request = new AuthRequest();
        request.setEmail("user@example.com");
        request.setPassword("wrong_password");

        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword("encoded_password");
        user.setRole("USER");
        user.setVerified(true);

        when(repo.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.login(request));
        assertTrue(exception.getMessage().contains("Invalid password"));
    }

    @Test
    void testRegister_Success() {
        AuthRequest request = new AuthRequest();
        request.setEmail("newuser@example.com");
        request.setPassword("password");

        when(repo.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded_password");

        service.register(request);

        verify(repo).save(any(User.class));
    }

    @Test
    void testRegister_UserAlreadyExists() {
        AuthRequest request = new AuthRequest();
        request.setEmail("existing@example.com");
        request.setPassword("password");

        User existing = new User();
        existing.setEmail("existing@example.com");

        when(repo.findByEmail(request.getEmail())).thenReturn(Optional.of(existing));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.register(request));
        assertTrue(exception.getMessage().contains("User already exists"));
        verify(repo, never()).save(any(User.class));
    }

    @Test
    void testHandleGoogleLogin_ExistingUser() {
        String email = "googleuser@example.com";
        User user = new User();
        user.setEmail(email);
        user.setRole("USER");
        user.setVerified(true);

        when(repo.findByEmail(email)).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(email, "USER")).thenReturn("google_jwt_token");

        String token = service.handleGoogleLogin(email);

        assertEquals("google_jwt_token", token);
        verify(repo, never()).save(any(User.class));
    }

    @Test
    void testHandleGoogleLogin_NewUser() {
        String email = "newgoogle@example.com";
        User savedUser = new User();
        savedUser.setEmail(email);
        savedUser.setRole("USER");

        when(repo.findByEmail(email)).thenReturn(Optional.empty());
        when(repo.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(email, "USER")).thenReturn("new_google_jwt_token");

        String token = service.handleGoogleLogin(email);

        assertEquals("new_google_jwt_token", token);
        verify(repo).save(any(User.class));
    }

    @Test
    void testLogin_Unverified() {
        AuthRequest request = new AuthRequest();
        request.setEmail("user@example.com");
        request.setPassword("password");

        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword("encoded_password");
        user.setRole("USER");
        user.setVerified(false);

        when(repo.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.login(request));
        assertTrue(exception.getMessage().contains("Please verify your email address"));
    }

    @Test
    void testVerifyEmail_Success() {
        String token = "valid_token";
        User user = new User();
        user.setEmail("user@example.com");
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(1));
        user.setVerified(false);

        when(repo.findByVerificationToken(token)).thenReturn(Optional.of(user));

        service.verifyEmail(token);

        assertTrue(user.isVerified());
        assertNull(user.getVerificationToken());
        assertNull(user.getTokenExpiry());
        verify(repo).save(user);
    }

    @Test
    void testVerifyEmail_Expired() {
        String token = "expired_token";
        User user = new User();
        user.setEmail("user@example.com");
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().minusHours(1));
        user.setVerified(false);

        when(repo.findByVerificationToken(token)).thenReturn(Optional.of(user));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.verifyEmail(token));
        assertTrue(exception.getMessage().contains("Verification token has expired"));
        verify(repo, never()).save(any(User.class));
    }

    @Test
    void testVerifyEmail_InvalidToken() {
        String token = "invalid_token";
        when(repo.findByVerificationToken(token)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.verifyEmail(token));
        assertTrue(exception.getMessage().contains("Invalid verification token"));
        verify(repo, never()).save(any(User.class));
    }
}
