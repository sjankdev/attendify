package com.app.attendify.event.dto;

public record EventStatisticsDTO(Double averageAge, Integer highestAge, Integer lowestAge, Long maleCount,
                                 Long femaleCount, Long otherCount) {
}
