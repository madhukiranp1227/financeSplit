package com.finsplit.service;

import com.finsplit.dto.AuthRequest;
import com.finsplit.dto.AuthResponse;
import com.finsplit.entity.User;
import com.finsplit.exception.BadRequestException;
import com.finsplit.repository.UserRepository;
import com.finsplit.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already in use");

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .build();
        userRepository.save(user);

        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        return new AuthResponse(jwtUtil.generateToken(ud), user.getId(), user.getName(), user.getEmail(), user.getCurrency());
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        return new AuthResponse(jwtUtil.generateToken(ud), user.getId(), user.getName(), user.getEmail(), user.getCurrency());
    }
}
