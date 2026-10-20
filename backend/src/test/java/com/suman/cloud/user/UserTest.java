package com.suman.cloud.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    @DisplayName("User entity initializes with default values and sets createdAt on onCreate")
    void shouldInitializeUserCorrectly() {
        User user = new User("sumankumar", "suman@example.com", "secretHash");

        assertEquals("sumankumar", user.getUsername());
        assertEquals("sumankumar", user.getName());
        assertEquals("suman@example.com", user.getEmail());
        assertEquals("secretHash", user.getPassword());
        assertNull(user.getCreatedAt());

        user.onCreate();
        assertNotNull(user.getCreatedAt());
        assertTrue(user.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test
    @DisplayName("User setters and getters work as expected")
    void shouldUpdateUserProperties() {
        User user = new User();
        user.setId(1L);
        user.setUsername("janedoe");
        user.setName("Jane Doe");
        user.setEmail("jane@example.com");
        user.setPassword("hashed123");
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);

        assertEquals(1L, user.getId());
        assertEquals("janedoe", user.getUsername());
        assertEquals("Jane Doe", user.getName());
        assertEquals("jane@example.com", user.getEmail());
        assertEquals("hashed123", user.getPassword());
        assertEquals(now, user.getCreatedAt());
    }
}
