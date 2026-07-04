package com.example.journal_service.service;

import com.example.journal_service.Dto.JournalAutoSaveDTO;
import com.example.journal_service.Dto.JournalRequestDTO;
import com.example.journal_service.Dto.JournalStatsDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface JournalService {
    JournalStatsDTO getJournalStats(String userEmail, String range);

    JournalRequestDTO createJournal(String userEmail, JournalRequestDTO dto);

    Page<JournalRequestDTO> getAllJournal(String userEmail, String role, int page, int size);

    JournalRequestDTO getTodayJournal(String userEmail);

    JournalRequestDTO updateJournal(Long journalId, String userEmail, JournalRequestDTO dto);

    void deleteJournal(Long journalId, String userEmail, String role);

    JournalRequestDTO autoSaveJournal(String userEmail, JournalAutoSaveDTO dto);

    int getJournalStreak(String userEmail);
}
