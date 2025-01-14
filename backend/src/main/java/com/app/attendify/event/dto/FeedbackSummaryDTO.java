package com.app.attendify.event.dto;

import java.util.List;

public class FeedbackSummaryDTO {

    private List<FeedbackOrganizerDTO> feedbacks;
    private double averageRating;

    public FeedbackSummaryDTO(List<FeedbackOrganizerDTO> feedbacks, double averageRating) {
        this.feedbacks = feedbacks;
        this.averageRating = averageRating;
    }

    public List<FeedbackOrganizerDTO> getFeedbacks() {
        return feedbacks;
    }

    public void setFeedbacks(List<FeedbackOrganizerDTO> feedbacks) {
        this.feedbacks = feedbacks;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }
}
