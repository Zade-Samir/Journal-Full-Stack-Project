package com.samir.journal_service.service.Impl;

import com.samir.journal_service.Dto.*;
import com.samir.journal_service.entity.*;
import com.samir.journal_service.exception.ResourceNotFoundException;
import com.samir.journal_service.mapper.JournalMapper;
import com.samir.journal_service.repo.GoalRepo;
import com.samir.journal_service.repo.JournalRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JournalServiceImplTest {

    @Mock
    private JournalRepo repo;

    @Mock
    private GoalRepo goalRepo;

    @Mock
    private JournalMapper mapper;

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
    void testCreateJournal_Success() {
        String email = "test@example.com";
        JournalRequestDTO dto = new JournalRequestDTO();
        dto.setWhatDidIDo("Work");
        dto.setFeeling("happy");

        Journal journal = new Journal();
        journal.setId(1L);
        journal.setUserId(email);
        journal.setDate(LocalDate.now());

        when(mapper.toEntity(dto)).thenReturn(journal);
        when(repo.save(any(Journal.class))).thenReturn(journal);
        when(mapper.toDTO(journal)).thenReturn(dto);

        JournalRequestDTO result = service.createJournal(email, dto);

        assertNotNull(result);
        verify(repo).save(any(Journal.class));
    }

    @Test
    void testGetTodayJournal_Found() {
        String email = "test@example.com";
        Journal journal = new Journal();
        journal.setId(1L);
        journal.setUserId(email);
        journal.setDate(LocalDate.now());

        JournalRequestDTO dto = new JournalRequestDTO();

        when(repo.findByUserIdAndDateAndIsDeletedFalse(eq(email), any(LocalDate.class)))
                .thenReturn(Optional.of(journal));
        when(mapper.toDTO(journal)).thenReturn(dto);

        JournalRequestDTO result = service.getTodayJournal(email);

        assertNotNull(result);
    }

    @Test
    void testGetTodayJournal_NotFound() {
        String email = "test@example.com";
        when(repo.findByUserIdAndDateAndIsDeletedFalse(eq(email), any(LocalDate.class)))
                .thenReturn(Optional.empty());

        JournalRequestDTO result = service.getTodayJournal(email);
        assertNull(result);
    }

    @Test
    void testDeleteJournal_Success() {
        String email = "test@example.com";
        Journal journal = new Journal();
        journal.setId(1L);
        journal.setUserId(email);
        journal.setDeleted(false);

        when(repo.findById(1L)).thenReturn(Optional.of(journal));

        service.deleteJournal(1L, email, "ROLE_USER");

        assertTrue(journal.isDeleted());
        verify(repo).save(journal);
    }

    @Test
    void testAutoSaveJournal_CreateNew() {
        String email = "test@example.com";
        JournalAutoSaveDTO dto = new JournalAutoSaveDTO();
        dto.setWhatDidIDo("Writing");

        Journal journal = new Journal();
        journal.setId(1L);
        journal.setUserId(email);
        journal.setWhatDidIDo("Writing");

        JournalRequestDTO resDto = new JournalRequestDTO();

        when(repo.findByUserIdAndDateAndIsDeletedFalse(eq(email), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        when(repo.save(any(Journal.class))).thenReturn(journal);
        when(mapper.toDTO(any(Journal.class))).thenReturn(resDto);

        JournalRequestDTO result = service.autoSaveJournal(email, dto);

        assertNotNull(result);
        verify(repo).save(any(Journal.class));
    }
}
