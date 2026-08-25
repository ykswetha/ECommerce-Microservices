package com.ecommerce.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.userservice.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

}
