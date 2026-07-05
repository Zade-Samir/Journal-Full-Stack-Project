package com.samir.journal_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@org.springframework.context.annotation.Import(com.samir.journal_service.mapper.JournalMapperImpl.class)
@org.springframework.test.context.TestPropertySource(properties = {
		"spring.datasource.url=jdbc:mysql://localhost:3306/journal_test_db?createDatabaseIfNotExist=true&serverTimezone=UTC",
		"spring.cache.type=none",
		"spring.flyway.enabled=false",
		"spring.jpa.hibernate.ddl-auto=create-drop"
})
class JournalServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
