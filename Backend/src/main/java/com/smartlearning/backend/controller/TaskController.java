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

    // Constructor Injection
    public TaskController(TaskService service) {
        this.service = service;
    }

    // ✅ Create a new task
    @PostMapping
    public Task create(@RequestBody Task t) {
        return service.createTask(t);
    }

    // ✅ Get all tasks
    @GetMapping
    public List<Task> all() {
        return service.getAllTasks();
    }

    // ✅ Mark task as completed
    @PutMapping("/{id}/complete")
    public Task complete(@PathVariable Long id) {
        return service.completeTask(id);
    }

    // ✅ AI / auto suggestion (or random task)
    @PostMapping("/suggest")
    public Task suggest() {
        return service.generateSuggestion();
    }

    // ✅ Dashboard stats
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return service.getStats();
    }

    // ✅ Notifications (due soon tasks)
    @GetMapping("/notifications")
    public List<Task> notifications() {
        return service.getDueSoonTasks();
    }

    // ✅ Update task
    @PutMapping("/{id}")
    public Task update(@PathVariable Long id, @RequestBody Task updatedTask) {
        return service.updateTask(id, updatedTask);
    }

    // ✅ Delete a task
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteTask(id);
    }
}