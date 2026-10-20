package com.suman.cloud;

import com.suman.cloud.file.FileRecordRepository;
import com.suman.cloud.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class SumanApplicationTests {

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private FileRecordRepository fileRecordRepository;

    @Test
    @DisplayName("Application context loads successfully")
    void contextLoads() {
    }
}
