package com.habittracker.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HabitApiTest {

    @Autowired MockMvc mockMvc;

    @Test
    void listHabits_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/habits"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void createHabit_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/habits")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"Test\",\"habitType\":\"POSITIVE\",\"rrule\":\"FREQ=DAILY\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void logCompletion_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/logs")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"habitId\":\"00000000-0000-0000-0000-000000000001\",\"date\":\"2026-05-06\",\"completed\":true,\"loggedAt\":\"2026-05-06T08:00:00Z\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void getHabitHistory_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/habits/00000000-0000-0000-0000-000000000001/logs"))
            .andExpect(status().isUnauthorized());
    }
}
