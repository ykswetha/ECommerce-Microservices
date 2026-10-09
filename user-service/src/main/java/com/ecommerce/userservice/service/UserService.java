package com.ecommerce.userservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.ecommerce.userservice.exception.UserNotFoundException;
import com.ecommerce.userservice.entity.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {
	
	@Autowired
	private UserRepository userRepository;

	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public User saveUser(User user) {
		if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
			user.setPassword(passwordEncoder.encode(user.getPassword()));
		}
	    return userRepository.save(user);
	}
	public List<User> getAllUsers() {
	    return userRepository.findAll();
	}
	public User getUserById(Long id) {
	    return userRepository.findById(id)
	            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
	}
	public User updateUser(Long id, User updatedUser) {
	    User existingUser = userRepository.findById(id).orElse(null);

	    if (existingUser == null) {
	        return null;
	    }

	    existingUser.setFirstName(updatedUser.getFirstName());
	    existingUser.setLastName(updatedUser.getLastName());
	    existingUser.setEmail(updatedUser.getEmail());
		if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
			if (!updatedUser.getPassword().startsWith("$2a$")) {
				existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
			} else {
				existingUser.setPassword(updatedUser.getPassword());
			}
		}
	    existingUser.setPhone(updatedUser.getPhone());
	    existingUser.setRole(updatedUser.getRole());

	    return userRepository.save(existingUser);
	}
	public boolean deleteUser(Long id) {

	    if (!userRepository.existsById(id)) {
	        return false;
	    }

	    userRepository.deleteById(id);
	    return true;
	}

}