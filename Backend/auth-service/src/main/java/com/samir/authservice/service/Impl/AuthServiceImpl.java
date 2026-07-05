package com.samir.authservice.service.Impl;

import com.samir.authservice.dto.AuthRequest;
import com.samir.authservice.dto.AuthResponse;
import com.samir.authservice.entity.User;
import com.samir.authservice.repo.UserRepo;
import com.samir.authservice.service.AuthService;
import com.samir.authservice.util.JwtUtil;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.samir.authservice.service.EmailService;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepo repo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Override
    public AuthResponse login(AuthRequest request) {

        LOGGER.info("Login attempt for email: {}", request.getEmail());

        User user = repo.findByEmail(request.getEmail())
                .orElseThrow(
                        () -> {
                            LOGGER.warn("User not found with email: {}", request.getEmail());
                            return new RuntimeException("User not found!!..");
                        }
                );

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {

            LOGGER.warn("Invalid password attempt for email: {}", request.getEmail());
            throw new RuntimeException("Invalid password...");
        }

        if (!user.isVerified()) {
            LOGGER.warn("Unverified login attempt for email: {}", request.getEmail());
            throw new RuntimeException("Please verify your email address before logging in.");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );

        String refreshToken = java.util.UUID.randomUUID().toString();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        repo.save(user);

        LOGGER.info("Login successful for email: {}", request.getEmail());

        return new AuthResponse(token, refreshToken);
    }


    @Override
    public void register(AuthRequest request) {
        LOGGER.info("Registering new user: {}", request.getEmail());

        //check user is already present or not -> Duplicate account creation blocked
        java.util.Optional<User> existingUserOpt = repo.findByEmail(request.getEmail());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.isVerified()) {
                LOGGER.warn("Duplicate registration attempt for verified user: {}", request.getEmail());
                throw new RuntimeException("User already exists!");
            }
            
            // Re-generate OTP code for unverified user (allows requesting resend/re-register)
            String otp = String.valueOf(100000 + new java.util.Random().nextInt(900000));
            existingUser.setVerificationToken(otp);
            existingUser.setTokenExpiry(LocalDateTime.now().plusMinutes(10));
            
            // If they changed their password, let's update it too
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
            
            repo.save(existingUser);
            LOGGER.info("Unverified user registered again, updated and generated new verification OTP for: {}", request.getEmail());
            
            emailService.sendVerificationEmail(existingUser.getEmail(), otp);
            return;
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        //make a user as default while register
        user.setRole("USER");
        
        // Generate 6-digit email verification OTP
        String otp = String.valueOf(100000 + new java.util.Random().nextInt(900000));
        user.setVerificationToken(otp);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(10));
        user.setVerified(false);

        repo.save(user);
        LOGGER.info("User registered successfully, verification OTP generated for: {}", request.getEmail());

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), otp);
    }

    @Override
    public AuthResponse handleGoogleLogin(String email) {

        User user = repo.findByEmail(email)
                .map(existingUser -> {
                    if (!existingUser.isVerified()) {
                        existingUser.setVerified(true);
                        existingUser.setVerificationToken(null);
                        existingUser.setTokenExpiry(null);
                        return repo.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setPassword(""); // not needed
                    newUser.setRole("USER");
                    newUser.setVerified(true);
                    return repo.save(newUser);
                });

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String refreshToken = java.util.UUID.randomUUID().toString();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        repo.save(user);

        return new AuthResponse(token, refreshToken);
    }

    @Override
    public void verifyOtp(String email, String code) {
        LOGGER.info("Verifying OTP code for email: {}", email);
        User user = repo.findByEmail(email)
                .orElseThrow(() -> {
                    LOGGER.warn("User not found with email during OTP verification: {}", email);
                    return new RuntimeException("User not found.");
                });

        if (user.isVerified()) {
            LOGGER.warn("User email already verified: {}", email);
            return;
        }

        if (user.getVerificationToken() == null || !user.getVerificationToken().equals(code)) {
            LOGGER.warn("Invalid verification OTP code for email: {}", email);
            throw new RuntimeException("Invalid verification code.");
        }

        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            LOGGER.warn("Expired verification OTP code for email: {}", email);
            throw new RuntimeException("Verification code has expired. Please register again.");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        repo.save(user);
        LOGGER.info("Email verified successfully using OTP for user: {}", user.getEmail());
    }

    @Override
    public void resendOtp(String email) {
        LOGGER.info("Resending OTP code for email: {}", email);
        User user = repo.findByEmail(email)
                .orElseThrow(() -> {
                    LOGGER.warn("User not found with email during OTP resend request: {}", email);
                    return new RuntimeException("User not found.");
                });

        if (user.isVerified()) {
            LOGGER.warn("User email already verified, cannot resend OTP: {}", email);
            throw new RuntimeException("Email already verified.");
        }

        // Generate new 6-digit OTP code
        String otp = String.valueOf(100000 + new java.util.Random().nextInt(900000));
        user.setVerificationToken(otp);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(10));
        repo.save(user);

        LOGGER.info("New verification OTP generated for resend: {}", email);
        emailService.sendVerificationEmail(user.getEmail(), otp);
    }

    @Override
    public AuthResponse refreshAccessToken(String refreshToken) {
        LOGGER.info("Attempting to refresh access token using refresh token");
        User user = repo.findByRefreshToken(refreshToken)
                .orElseThrow(() -> {
                    LOGGER.warn("Invalid refresh token");
                    return new RuntimeException("Invalid refresh token.");
                });

        if (user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            LOGGER.warn("Expired refresh token for user: {}", user.getEmail());
            throw new RuntimeException("Refresh token has expired. Please log in again.");
        }

        // Generate a new access token
        String newAccessToken = jwtUtil.generateToken(user.getEmail(), user.getRole());
        LOGGER.info("Successfully refreshed access token for user: {}", user.getEmail());

        return new AuthResponse(newAccessToken, refreshToken);
    }

    @Override
    public void logout(String refreshToken) {
        LOGGER.info("Logging out and revoking refresh token");
        repo.findByRefreshToken(refreshToken).ifPresent(user -> {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            repo.save(user);
            LOGGER.info("Successfully revoked refresh token for user: {}", user.getEmail());
        });
    }
}

















