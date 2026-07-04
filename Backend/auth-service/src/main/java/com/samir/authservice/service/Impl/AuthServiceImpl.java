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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepo repo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

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

        repo.save(user);
        LOGGER.info("User registered successfully: {}", request.getEmail());
    }

    @Override
    public String handleGoogleLogin(String email) {

        User user = repo.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setPassword(""); // not needed
                    newUser.setRole("USER");
                    return repo.save(newUser);
                });

        return jwtUtil.generateToken(user.getEmail(), user.getRole());
    }
}

















