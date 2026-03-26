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
    public Task create(@RequestBody Task t) {
        return service.createTask(t);
    }

    @GetMapping
    public List<Task> all() {
        return service.getAllTasks();
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
    public Map<String, Object> stats() {
        return service.getStats();
    }

    @GetMapping("/notifications")
    public List<Task> notifications() {
        return service.getDueSoonTasks();
    }
}