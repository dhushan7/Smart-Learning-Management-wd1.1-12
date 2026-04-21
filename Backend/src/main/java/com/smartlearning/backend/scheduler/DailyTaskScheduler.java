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

    @Scheduled(cron = "0 0 8 * * ?")
    public void morningAI() {
        System.out.println("Morning scheduler running - AI suggestion skipped");
    }

    // NOTIFICATIONS (CORRECT)
    @Scheduled(cron = "0 0 9 * * ?")
    public void notifyUsers() {
        service.processAllUsersNotifications();
    }

    // CLEANUP EXPIRED TASKS
    @Scheduled(cron = "0 00 00 * * ?", zone = "Asia/Colombo")
    public void removeExpiredTasks() {
        service.deleteExpiredTasks();
    }
}