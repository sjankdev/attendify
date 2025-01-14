package com.app.attendify.utils;

import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Component
public class TimeZoneConversionUtil {

    private final ZoneId BELGRADE_ZONE = ZoneId.of("Europe/Belgrade");
    private final ZoneId UTC_ZONE = ZoneId.of("UTC");

    public LocalDateTime convertToBelgradeTime(LocalDateTime utcDateTime) {
        ZonedDateTime utcZonedDateTime = utcDateTime.atZone(UTC_ZONE);
        ZonedDateTime belgradeZonedDateTime = utcZonedDateTime.withZoneSameInstant(BELGRADE_ZONE);
        return belgradeZonedDateTime.toLocalDateTime();
    }
}
