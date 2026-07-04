package com.example.journal_service.mapper;

import com.example.journal_service.Dto.JournalRequestDTO;
import com.example.journal_service.entity.Journal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface JournalMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "date", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Journal toEntity(JournalRequestDTO dto);
    JournalRequestDTO toDTO(Journal journal);
}
