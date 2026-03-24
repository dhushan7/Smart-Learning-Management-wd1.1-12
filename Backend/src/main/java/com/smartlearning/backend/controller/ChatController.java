package com.smartlearning.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ChatController {

    private static final String FALLBACK_REPLY = "__USE_LOCAL_FALLBACK__";
    private static final String SYSTEM_PROMPT = """
            You are a chatbot for the SLIIT Smart Learning Platform.
            Smart Learning is a student learning website and academic support platform.
            Its main features include Quiz Bank, quiz attempts, quiz results, learning support, and the Community Chatbot.
            The Quiz Bank lets students browse quizzes, open a selected quiz, answer questions, submit, and view scores.
            The Community Chatbot helps explain platform features, answer common questions, and guide students through tasks.
            If a user asks "What is Smart Learning?" or "What is this website?", explain that it is an online learning platform that helps students manage quizzes, results, and academic activities.
            Help students with quizzes, assignments, login, results, navigation, and general platform understanding.
            Use natural, clear answers with practical common sense.
            Keep answers concise, friendly, and accurate.
            If the user asks something unrelated to the platform, answer briefly if it is simple small talk, otherwise guide them back to platform-related questions.
            """;

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/responses}")
    private String apiUrl;

    @Value("${openai.model:gpt-4.1-mini}")
    private String model;

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.getOrDefault("message", "").trim();
        if (userMessage.isEmpty()) {
            return Map.of("reply", "Please enter a message.");
        }

        if (apiKey == null || apiKey.isBlank()) {
            return Map.of(
                    "reply", FALLBACK_REPLY,
                    "error", "OpenAI API key is not configured on the backend."
            );
        }

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        List<Map<String, Object>> inputMessages = buildInputMessages(request, userMessage);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "instructions", SYSTEM_PROMPT,
                "input", inputMessages
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            String reply = extractReply(response.getBody());

            if (reply == null || reply.isBlank()) {
                return Map.of(
                        "reply", FALLBACK_REPLY,
                        "error", "OpenAI response did not contain any text output."
                );
            }

            return Map.of("reply", reply);
        } catch (RestClientResponseException e) {
            String responseBody = e.getResponseBodyAsString();
            String errorMessage = "OpenAI API request failed with status " + e.getStatusCode().value();
            if (responseBody != null && !responseBody.isBlank()) {
                errorMessage += ": " + responseBody;
            }

            return Map.of(
                    "reply", FALLBACK_REPLY,
                    "error", errorMessage
            );
        } catch (Exception e) {
            return Map.of(
                    "reply", FALLBACK_REPLY,
                    "error", "OpenAI API request could not be completed: " + e.getMessage()
            );
        }
    }

    private List<Map<String, Object>> buildInputMessages(Map<String, String> request, String userMessage) {
        List<Map<String, Object>> inputMessages = new ArrayList<>();

        for (int index = 1; index <= 6; index++) {
            String role = request.get("historyRole" + index);
            String content = request.get("historyContent" + index);

            if (role == null || content == null) {
                continue;
            }

            String normalizedRole = role.trim().toLowerCase();
            String normalizedContent = content.trim();

            if (normalizedContent.isBlank()) {
                continue;
            }

            if (!"user".equals(normalizedRole) && !"assistant".equals(normalizedRole)) {
                continue;
            }

            inputMessages.add(createInputMessage(normalizedRole, normalizedContent));
        }

        inputMessages.add(createInputMessage("user", userMessage));
        return inputMessages;
    }

    private Map<String, Object> createInputMessage(String role, String content) {
        Map<String, Object> message = new HashMap<>();
        message.put("role", role);
        message.put("content", content);
        return message;
    }

    private String extractReply(Map<String, Object> responseBody) {
        if (responseBody == null) {
            return null;
        }

        Object output = responseBody.get("output");
        if (!(output instanceof List<?> outputItems)) {
            return null;
        }

        List<String> parts = new ArrayList<>();

        for (Object outputItem : outputItems) {
            if (!(outputItem instanceof Map<?, ?> itemMap)) {
                continue;
            }

            Object content = itemMap.get("content");
            if (!(content instanceof List<?> contentItems)) {
                continue;
            }

            for (Object contentItem : contentItems) {
                if (!(contentItem instanceof Map<?, ?> contentMap)) {
                    continue;
                }

                Object type = contentMap.get("type");
                Object text = contentMap.get("text");
                if ("output_text".equals(type) && text instanceof String textValue && !textValue.isBlank()) {
                    parts.add(textValue.trim());
                }
            }
        }

        if (parts.isEmpty()) {
            return null;
        }

        return String.join("\n", parts);
    }
}
