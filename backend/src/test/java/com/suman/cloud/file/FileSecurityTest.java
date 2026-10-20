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
    @DisplayName("GET /api/files/1/url without authentication should be rejected with 403 Forbidden")
    void shouldRejectUnauthenticatedGetFileUrl() throws Exception {
        mockMvc.perform(get("/api/files/1/url"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/files/1/download-url without authentication should be rejected with 403 Forbidden")
    void shouldRejectUnauthenticatedGetFileDownloadUrl() throws Exception {
        mockMvc.perform(get("/api/files/1/download-url"))
                .andExpect(status().isForbidden());
    }
}
