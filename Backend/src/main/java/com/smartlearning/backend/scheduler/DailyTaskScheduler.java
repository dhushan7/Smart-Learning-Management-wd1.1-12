package com.smartlearning.backend.scheduler;

import com.smartlearning.backend.service.TaskService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailyTaskScheduler {

    private final TaskService service;

    public DailyTaskScheduler(TaskService service) {
        this.service = service;
    }

    // Runs every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * ?")
    public void morningAI() {
        service.generateSuggestion();
    }

    // Runs every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * ?")
    public void notifyUsers() {
        service.getDueSoonTasks();
    }

    // Runs every day at 12:00 AM (midnight)
    @Scheduled(cron = "0 0 0 * * ?")
    public void removeExpiredTasks() {
        service.deleteExpiredTasks();
    }
}