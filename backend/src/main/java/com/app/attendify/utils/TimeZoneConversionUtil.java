package com.app.attendify.utils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class TimeZoneConversionUtil {

    private static final ZoneId BELGRADE_ZONE = ZoneId.of("Europe/Belgrade");
    private static final ZoneId UTC_ZONE = ZoneId.of("UTC");

    public static LocalDateTime convertToBelgradeTime(LocalDateTime utcDateTime) {
        ZonedDateTime utcZonedDateTime = utcDateTime.atZone(UTC_ZONE);
        ZonedDateTime belgradeZonedDateTime = utcZonedDateTime.withZoneSameInstant(BELGRADE_ZONE);
        return belgradeZonedDateTime.toLocalDateTime();
    }
}
