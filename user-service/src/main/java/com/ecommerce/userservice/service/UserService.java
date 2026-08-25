package com.ecommerce.userservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.ecommerce.userservice.exception.UserNotFoundException;
import com.ecommerce.userservice.repository.UserRepository;
import com.ecommerce.userservice.entity.User;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {
	
	@Autowired
	private UserRepository userRepository;
	public User saveUser(User user) {
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
	    existingUser.setPassword(updatedUser.getPassword());
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