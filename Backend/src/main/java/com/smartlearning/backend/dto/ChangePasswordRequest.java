package com.smartlearning.backend.dto;

public class ChangePasswordRequest {

    private String email;
    private String currentPassword;
    private String newPassword;
    private String confirmNewPassword;

    public String getEmail() {return email;}
    public void setEmail(String email) {this.email = email;}

    public String getCurrentPassword() {return currentPassword;}
    public void setCurrentPassword(String currentPassword) {this.currentPassword = currentPassword;}

    public String getNewPassword() {return newPassword;}
    public void setNewPassword(String newPassword) {this.newPassword = newPassword;}

    public String getConfirmNewPassword() {return confirmNewPassword;}
    public void setConfirmNewPassword(String confirmNewPassword) {this.confirmNewPassword = confirmNewPassword;}
}