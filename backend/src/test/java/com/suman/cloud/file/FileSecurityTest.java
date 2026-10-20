package com.suman.cloud.file;

import com.suman.cloud.security.JwtAuthFilter;
import com.suman.cloud.security.JwtService;
import com.suman.cloud.security.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FileController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class FileSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FileService fileService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    @DisplayName("GET /api/files without authentication should be rejected with 403 Forbidden")
    void shouldRejectUnauthenticatedGetFiles() throws Exception {
        mockMvc.perform(get("/api/files"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/files without authentication should be rejected with 403 Forbidden")
    void shouldRejectUnauthenticatedPostFiles() throws Exception {
        mockMvc.perform(post("/api/files"))
                .andExpect(status().isForbidden());
    }
}
