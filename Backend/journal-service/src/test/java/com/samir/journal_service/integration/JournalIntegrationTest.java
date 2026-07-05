package com.samir.journal_service.integration;

import com.samir.journal_service.entity.Journal;
import com.samir.journal_service.repo.JournalRepo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Disabled;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@Disabled("Requires a running Docker daemon to start MySQL container")
@ContextConfiguration(initializers = JournalIntegrationTest.Initializer.class)
class JournalIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.36")
            .withDatabaseName("testdb")
            .withUsername("testuser")
            .withPassword("testpass");

    static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=" + mysql.getJdbcUrl(),
                    "spring.datasource.username=" + mysql.getUsername(),
                    "spring.datasource.password=" + mysql.getPassword(),
                    "spring.jpa.hibernate.ddl-auto=create-drop",
                    "spring.flyway.enabled=false",
                    "spring.cache.type=none"
            ).applyTo(configurableApplicationContext.getEnvironment());
        }
    }

    @Autowired
    private JournalRepo repo;

    @Test
    void testSaveAndRetrieveJournal() {
        Journal journal = new Journal();
        journal.setUserId("integration@example.com");
        journal.setDate(LocalDate.now());
        journal.setWhatDidIDo("Integrated with Testcontainers");

        Journal saved = repo.save(journal);

        Optional<Journal> retrieved = repo.findById(saved.getId());
        assertTrue(retrieved.isPresent());
        assertTrue(retrieved.get().getWhatDidIDo().contains("Testcontainers"));
    }
}
