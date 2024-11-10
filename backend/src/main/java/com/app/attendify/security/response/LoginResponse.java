package com.app.attendify.security.response;

public class LoginResponse {
    private String token;
    private long expiresIn;
    private String message;
    private String role;

    public String getToken() {
        return token;
    }

    public LoginResponse setToken(String token) {
        this.token = token;
        return this;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public LoginResponse setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
        return this;
    }

    public String getMessage() {
        return message;
    }

    public LoginResponse setMessage(String message) {
        this.message = message;
        return this;
    }

    public String getRole() {
        return role;
    }

    public LoginResponse setRole(String role) {
        this.role = role;
        return this;
    }
}
