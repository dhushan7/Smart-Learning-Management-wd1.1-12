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

    @Value("${gemini.api.key:${openai.api.key:}}")
    private String apiKey;

    @Value("${gemini.api.url:${openai.api.url:https://generativelanguage.googleapis.com/v1beta/models}}")
    private String apiUrl;

    @Value("${gemini.model:${openai.model:gemini-2.5-flash}}")
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
                    "error", "Gemini API key is not configured on the backend."
            );
        }

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        List<Map<String, Object>> inputMessages = buildContents(request, userMessage);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("system_instruction", Map.of(
                "parts", List.of(Map.of("text", SYSTEM_PROMPT))
        ));
        requestBody.put("contents", inputMessages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        String endpoint = apiUrl + "/" + model + ":generateContent";

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, entity, Map.class);
            String reply = extractReply(response.getBody());

            if (reply == null || reply.isBlank()) {
                return Map.of(
                        "reply", FALLBACK_REPLY,
                        "error", "Gemini response did not contain any text output."
                );
            }

            return Map.of("reply", reply);
        } catch (RestClientResponseException e) {
            String responseBody = e.getResponseBodyAsString();
            String errorMessage = "Gemini API request failed with status " + e.getStatusCode().value();
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
                    "error", "Gemini API request could not be completed: " + e.getMessage()
            );
        }
    }

    private List<Map<String, Object>> buildContents(Map<String, String> request, String userMessage) {
        List<Map<String, Object>> contents = new ArrayList<>();

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

            contents.add(createContent(
                    "assistant".equals(normalizedRole) ? "model" : "user",
                    normalizedContent
            ));
        }

        contents.add(createContent("user", userMessage));
        return contents;
    }

    private Map<String, Object> createContent(String role, String content) {
        Map<String, Object> message = new HashMap<>();
        message.put("role", role);
        message.put("parts", List.of(Map.of("text", content)));
        return message;
    }

    private String extractReply(Map<String, Object> responseBody) {
        if (responseBody == null) {
            return null;
        }

        Object candidates = responseBody.get("candidates");
        if (!(candidates instanceof List<?> candidateItems)) {
            return null;
        }

        List<String> parts = new ArrayList<>();

        for (Object candidateItem : candidateItems) {
            if (!(candidateItem instanceof Map<?, ?> candidateMap)) {
                continue;
            }

            Object content = candidateMap.get("content");
            if (!(content instanceof Map<?, ?> contentMap)) {
                continue;
            }

            Object contentParts = contentMap.get("parts");
            if (!(contentParts instanceof List<?> partItems)) {
                continue;
            }

            for (Object contentItem : partItems) {
                if (!(contentItem instanceof Map<?, ?> partMap)) {
                    continue;
                }

                Object text = partMap.get("text");
                if (text instanceof String textValue && !textValue.isBlank()) {
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
