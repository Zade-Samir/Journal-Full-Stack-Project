package com.samir.journal_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.samir.journal_service.Dto.JournalRequestDTO;
import com.samir.journal_service.config.GatewayAuthenticationFilter;
import com.samir.journal_service.service.JournalService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import org.junit.jupiter.api.BeforeEach;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import static org.mockito.Mockito.doAnswer;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JournalController.class)
class JournalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JournalService service;

    @MockBean
    private GatewayAuthenticationFilter gatewayAuthenticationFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() throws Exception {
        doAnswer(invocation -> {
            ServletRequest request = invocation.getArgument(0);
            ServletResponse response = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(gatewayAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void testGetTodayJournal_Success() throws Exception {
        JournalRequestDTO dto = new JournalRequestDTO();
        dto.setWhatDidIDo("Work out");

        when(service.getTodayJournal("user@example.com")).thenReturn(dto);

        mockMvc.perform(get("/journal/today")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.whatDidIDo").value("Work out"));
    }

    @Test
    void testGetTodayJournal_Unauthorized() throws Exception {
        // No mock user, should fail due to security
        mockMvc.perform(get("/journal/today")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void testCreateJournal_Success() throws Exception {
        JournalRequestDTO dto = new JournalRequestDTO();
        dto.setWhatDidIDo("Testing my code today");
        dto.setBestMoment("Writing clean tests");
        dto.setWhatILearned("MockMvc validation");
        dto.setWhatIDoForGoal("My progress today");
        dto.setFeeling("happy");

        when(service.createJournal(eq("user@example.com"), any(JournalRequestDTO.class))).thenReturn(dto);

        mockMvc.perform(post("/journal")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.whatDidIDo").value("Testing my code today"));
    }
}
