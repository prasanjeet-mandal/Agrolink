package com.agrolink.dto.ai;

import jakarta.validation.constraints.NotBlank;

public class ChatRequest {

        @NotBlank
        private String question;

        public ChatRequest() {
        }

        public ChatRequest(String question) {
                this.question = question;
        }

        public String getQuestion() {
                return question;
        }

        public void setQuestion(String question) {
                this.question = question;
        }
}