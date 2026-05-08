package com.habittracker.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowTest {

    @Autowired MockMvc mockMvc;

    @Test
    void exchange_missingCode_returns422() throws Exception {
        mockMvc.perform(post("/api/v1/auth/exchange")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"codeVerifier\":\"verifier\"}"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.violations").isArray());
    }

    @Test
    void exchange_missingBothFields_returnsMultipleViolations() throws Exception {
        mockMvc.perform(post("/api/v1/auth/exchange")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.violations").isArray());
    }

    @Test
    void refresh_invalidToken_returns404() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"refreshToken\":\"invalid-token-that-does-not-exist\"}"))
            .andExpect(status().isNotFound());
    }

    @Test
    void refresh_missingToken_returns422() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
            .andExpect(status().isUnprocessableEntity());
    }
}
