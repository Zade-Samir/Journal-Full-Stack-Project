package com.samir.journal_service.service.Impl;

import com.samir.journal_service.repo.JournalRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class JournalServiceImplTest {

    @Mock
    private JournalRepo repo;

    @InjectMocks
    private JournalServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetJournalStreak_EmptyDates() {
        String email = "test@example.com";
        when(repo.findDatesByUserIdAndIsDeletedFalse(email)).thenReturn(Collections.emptyList());

        int streak = service.getJournalStreak(email);

        assertEquals(0, streak);
    }

    @Test
    void testGetJournalStreak_StreakBroken() {
        String email = "test@example.com";
        LocalDate today = LocalDate.now();
        List<LocalDate> dates = Arrays.asList(today.minusDays(2), today.minusDays(3));
        when(repo.findDatesByUserIdAndIsDeletedFalse(email)).thenReturn(dates);

        int streak = service.getJournalStreak(email);

        assertEquals(0, streak);
    }

    @Test
    void testGetJournalStreak_StreakWithToday() {
        String email = "test@example.com";
        LocalDate today = LocalDate.now();
        List<LocalDate> dates = Arrays.asList(today, today.minusDays(1), today.minusDays(2));
        when(repo.findDatesByUserIdAndIsDeletedFalse(email)).thenReturn(dates);

        int streak = service.getJournalStreak(email);

        assertEquals(3, streak);
    }

    @Test
    void testGetJournalStreak_StreakWithYesterday() {
        String email = "test@example.com";
        LocalDate today = LocalDate.now();
        List<LocalDate> dates = Arrays.asList(today.minusDays(1), today.minusDays(2));
        when(repo.findDatesByUserIdAndIsDeletedFalse(email)).thenReturn(dates);

        int streak = service.getJournalStreak(email);

        assertEquals(2, streak);
    }

    @Test
    void testGetJournalStreak_StreakWithDuplicates() {
        String email = "test@example.com";
        LocalDate today = LocalDate.now();
        List<LocalDate> dates = Arrays.asList(today, today, today.minusDays(1), today.minusDays(2), today.minusDays(2));
        when(repo.findDatesByUserIdAndIsDeletedFalse(email)).thenReturn(dates);

        int streak = service.getJournalStreak(email);

        assertEquals(3, streak);
    }
}
