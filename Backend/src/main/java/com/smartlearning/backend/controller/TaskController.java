package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.Task;
import com.smartlearning.backend.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @PostMapping
    public Task create(@RequestBody Task t, @RequestParam String email) {
        return service.createTask(t, email);
    }

    @GetMapping
    public List<Task> all(@RequestParam String email) {
        return service.getTasksByUser(email);
    }

    @PutMapping("/{id}/complete")
    public Task complete(@PathVariable Long id) {
        return service.completeTask(id);
    }

    @PostMapping("/suggest")
    public Task suggest() {
        return service.generateSuggestion();
    }

    @GetMapping("/stats")
    public Map<String, Object> stats(@RequestParam String email) {
        return service.getStatsByUser(email);
    }

    // Add this inside TaskController
    @GetMapping("/notifications")
    public List<Task> getNotifications(@RequestParam String email) {
        return service.getDueSoonTasks(email);
    }

    @PutMapping("/{id}/dismissNotification")
    public Task dismissNotification(@PathVariable Long id) {
        return service.dismissNotification(id);
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable Long id, @RequestBody Task updatedTask) {
        return service.updateTask(id, updatedTask);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteTask(id);
    }
}