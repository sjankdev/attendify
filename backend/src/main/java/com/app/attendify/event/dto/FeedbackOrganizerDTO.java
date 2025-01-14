package com.app.attendify.event.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class FeedbackOrganizerDTO {

    private String participantName;

    private String comments;

    @NotNull(message = "Rating cannot be null")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be no greater than 5")
    private double rating;

    public FeedbackOrganizerDTO() {
    }

    public FeedbackOrganizerDTO(String participantName, int rating, String comments) {
        this.participantName = participantName;
        this.rating = rating;
        this.comments = comments;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }
}

