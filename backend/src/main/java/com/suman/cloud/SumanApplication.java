package com.suman.cloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entrypoint for SUMAN Cloud Storage backend service.
 */
@SpringBootApplication
public class SumanApplication {

    public static void main(String[] args) {
        SpringApplication.run(SumanApplication.class, args);
    }
}
