package com.app.attendify.event.services;

import com.app.attendify.event.model.EventAttendance;
import com.app.attendify.eventParticipant.enums.Gender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class StatisticsService {

    public Map<String, Object> calculateAgeStats(List<Integer> ages) {
        if (ages.isEmpty()) {
            return Map.of("averageAge", 0.0, "highestAge", 0, "lowestAge", 0);
        }

        Double averageAge = ages.stream().mapToInt(Integer::intValue).average().orElse(0.0);
        Integer highestAge = ages.stream().max(Integer::compareTo).orElse(null);
        Integer lowestAge = ages.stream().min(Integer::compareTo).orElse(null);

        return Map.of(
                "averageAge", averageAge,
                "highestAge", highestAge != null ? highestAge : 0,
                "lowestAge", lowestAge != null ? lowestAge : 0
        );
    }

    public Map<String, Long> calculateGenderCounts(List<EventAttendance> attendances) {
        long maleCount = attendances.stream()
                .filter(attendance -> attendance.getParticipant().getGender() == Gender.MALE)
                .count();

        long femaleCount = attendances.stream()
                .filter(attendance -> attendance.getParticipant().getGender() == Gender.FEMALE)
                .count();

        long otherCount = attendances.stream()
                .filter(attendance -> attendance.getParticipant().getGender() == Gender.OTHER)
                .count();

        return Map.of("maleCount", maleCount, "femaleCount", femaleCount, "otherCount", otherCount);
    }
}
