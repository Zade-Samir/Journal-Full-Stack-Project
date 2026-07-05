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

        LOGGER.info("Login successful for email: {}", request.getEmail());

        return new AuthResponse(token);
    }


    @Override
    public void register(AuthRequest request) {
        LOGGER.info("Registering new user: {}", request.getEmail());

        //check user is already present or not -> Duplicate account creation blocked
        if (repo.findByEmail(request.getEmail()).isPresent()) {
            LOGGER.warn("Duplicate registration attempt: {}", request.getEmail());
            throw new RuntimeException("User already exists!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        //make a user as default while register
        user.setRole("USER");
        
        // Generate email verification token
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(24));
        user.setVerified(false);

        repo.save(user);
        LOGGER.info("User registered successfully, verification token generated for: {}", request.getEmail());

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), token);
    }

    @Override
    public String handleGoogleLogin(String email) {

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

        return jwtUtil.generateToken(user.getEmail(), user.getRole());
    }

    @Override
    public void verifyEmail(String token) {
        LOGGER.info("Verifying email for token: {}", token);
        User user = repo.findByVerificationToken(token)
                .orElseThrow(() -> {
                    LOGGER.warn("Invalid verification token: {}", token);
                    return new RuntimeException("Invalid verification token.");
                });

        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            LOGGER.warn("Expired verification token for email: {}", user.getEmail());
            throw new RuntimeException("Verification token has expired. Please register again.");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        repo.save(user);
        LOGGER.info("Email verified successfully for user: {}", user.getEmail());
    }
}

















