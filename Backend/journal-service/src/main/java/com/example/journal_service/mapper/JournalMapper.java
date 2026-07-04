package com.example.journal_service.mapper;

import com.example.journal_service.Dto.GoalDTO;
import com.example.journal_service.Dto.GoalRequestDTO;
import com.example.journal_service.Dto.JournalRequestDTO;
import com.example.journal_service.entity.Goal;
import com.example.journal_service.entity.Journal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JournalMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "date", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "goals", ignore = true)
    Journal toEntity(JournalRequestDTO dto);

    @Mapping(target = "goalIds", expression = "java(journal.getGoals() == null ? null : journal.getGoals().stream().map(g -> g.getId()).collect(java.util.stream.Collectors.toList()))")
    JournalRequestDTO toDTO(Journal journal);

    GoalDTO toGoalDTO(Goal goal);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Goal toGoal(GoalRequestDTO dto);
}
