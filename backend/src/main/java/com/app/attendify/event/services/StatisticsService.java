package com.app.attendify.event.services;

import com.app.attendify.event.model.EventAttendance;
import com.app.attendify.eventParticipant.enums.EducationLevel;
import com.app.attendify.eventParticipant.enums.Gender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public Map<String, Object> calculateExperienceStats(List<Integer> experienceList) {
        if (experienceList.isEmpty()) {
            return Map.of("averageExperience", 0.0, "highestExperience", 0, "lowestExperience", 0);
        }

        Double averageExperience = experienceList.stream().mapToInt(Integer::intValue).average().orElse(0.0);
        Integer highestExperience = experienceList.stream().max(Integer::compareTo).orElse(0);
        Integer lowestExperience = experienceList.stream().min(Integer::compareTo).orElse(0);

        return Map.of(
                "averageExperience", averageExperience,
                "highestExperience", highestExperience,
                "lowestExperience", lowestExperience
        );
    }

    public Map<EducationLevel, Long> calculateEducationLevelStats(List<EventAttendance> attendances) {
        return attendances.stream()
                .collect(Collectors.groupingBy(
                        attendance -> attendance.getParticipant().getEducationLevel(),
                        Collectors.counting()
                ));
    }
}
