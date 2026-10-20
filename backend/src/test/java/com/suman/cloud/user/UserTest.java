package com.suman.cloud.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    @DisplayName("User entity initializes with default values and sets createdAt on onCreate")
    void shouldInitializeUserCorrectly() {
        User user = new User("Suman", "suman@example.com", "secretHash");

        assertEquals("Suman", user.getName());
        assertEquals("suman@example.com", user.getEmail());
        assertEquals("secretHash", user.getPassword());
        assertFalse(user.isEmailVerified());
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
        user.setName("Jane Doe");
        user.setEmail("jane@example.com");
        user.setPassword("hashed123");
        user.setEmailVerified(true);
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);

        assertEquals(1L, user.getId());
        assertEquals("Jane Doe", user.getName());
        assertEquals("jane@example.com", user.getEmail());
        assertEquals("hashed123", user.getPassword());
        assertTrue(user.isEmailVerified());
        assertEquals(now, user.getCreatedAt());
    }
}
