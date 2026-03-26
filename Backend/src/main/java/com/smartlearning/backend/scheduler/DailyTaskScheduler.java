package com.smartlearning.backend.scheduler;

import com.smartlearning.backend.service.TaskService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailyTaskScheduler {
    private final TaskService service;

    public DailyTaskScheduler(TaskService service) { this.service = service; }

    @Scheduled(cron = "0 0 8 * * ?")
    public void morningAI() { service.generateSuggestion(); }

    @Scheduled(cron = "0 0 9 * * ?")
    public void notifyUsers() { service.getDueSoonTasks(); }
}