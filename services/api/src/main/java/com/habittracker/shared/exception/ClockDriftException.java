package com.habittracker.shared.exception;
public class ClockDriftException extends RuntimeException {
    public ClockDriftException(String message) { super(message); }
}
