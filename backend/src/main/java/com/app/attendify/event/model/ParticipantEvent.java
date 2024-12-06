package com.app.attendify.event.model;

import com.app.attendify.eventParticipant.model.EventParticipant;
import jakarta.persistence.*;


@Entity
public class ParticipantEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private EventParticipant participant;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    public ParticipantEvent() {}

    public ParticipantEvent(EventParticipant participant, Event event) {
        this.participant = participant;
        this.event = event;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public EventParticipant getParticipant() {
        return participant;
    }

    public void setParticipant(EventParticipant participant) {
        this.participant = participant;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }
}
