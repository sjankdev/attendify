package com.app.attendify.event.dto;

import java.util.Map;

public record EventStatisticsDTO(
        Double averageAge,
        Integer highestAge,
        Integer lowestAge,
        Long maleCount,
        Long femaleCount,
        Long otherCount,
        Double averageExperience,
        Integer highestExperience,
        Integer lowestExperience,
        Map<String, EducationLevelStatsDTO> educationLevelStats
) {
}
