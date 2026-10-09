package com.ecommerce.userservice.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PutMapping;
import com.ecommerce.userservice.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import com.ecommerce.userservice.entity.User;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;

@CrossOrigin(origins = "*")
@RestController
public class UserController {
	
	@Autowired
	private UserService userService;
	
	@PostMapping("/users")
	public User createUser(@RequestBody User user) {
	    return userService.saveUser(user);
	}
	@GetMapping("/users")
	public List<User> getAllUsers() {
	    return userService.getAllUsers();
	}
	@GetMapping("/users/{id}")
	public User getUserById(@PathVariable Long id) {
	    return userService.getUserById(id);
	}
	@PutMapping("/users/{id}")
	public User updateUser(@PathVariable Long id, @RequestBody User user) {
	    return userService.updateUser(id, user);
	}
	@DeleteMapping("/users/{id}")
	public String deleteUser(@PathVariable Long id) {

	    boolean deleted = userService.deleteUser(id);

	    if (!deleted) {
	        return "User not found";
	    }

	    return "User deleted successfully";
	}
}