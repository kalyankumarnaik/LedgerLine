package com.ledgerline.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AdjustmentApprovalDto {
    @NotBlank(message = "Decision is required (APPROVED or REJECTED)")
    private String decision;

    private String comments;

    public AdjustmentApprovalDto() {}

    public AdjustmentApprovalDto(String decision, String comments) {
        this.decision = decision;
        this.comments = comments;
    }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
