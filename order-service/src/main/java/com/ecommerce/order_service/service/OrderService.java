package com.ecommerce.order_service.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import com.ecommerce.order_service.ProductResponse;
import com.ecommerce.order_service.entity.Order;
import com.ecommerce.order_service.repository.OrderRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    private RestClient productRestClient =
            RestClient.create("http://localhost:8082");

    private RestClient userRestClient =
            RestClient.create("http://localhost:8081");


    // CREATE ORDER
    public Order saveOrder(Order order) {

        // 1. Check whether user exists
        try {

            userRestClient.get()
                    .uri("/users/{id}", order.getUserId())
                    .retrieve()
                    .body(String.class);

        } catch (Exception e) {
            e.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error while calling Product Service: " + e.getMessage()
            );
        }


        // 2. Check whether product exists
        ProductResponse product;

        try {

            product = productRestClient.get()
                    .uri("/products/{id}", order.getProductId())
                    .retrieve()
                    .body(ProductResponse.class);

        } catch (Exception e) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found with id: " + order.getProductId()
            );
        }


        // 3. Check stock
        if (order.getQuantity() > product.getQuantity()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock. Available quantity: "
                            + product.getQuantity()
            );
        }


        // 4. Calculate total price
        order.setTotalPrice(
                product.getPrice() * order.getQuantity()
        );


        // 5. Reduce product stock
        product.setQuantity(
                product.getQuantity() - order.getQuantity()
        );

        productRestClient.put()
                .uri("/products/{id}", order.getProductId())
                .body(product)
                .retrieve()
                .body(ProductResponse.class);


        // 6. Default status
        if (order.getStatus() == null ||
                order.getStatus().isBlank()) {

            order.setStatus("PLACED");
        }


        // 7. Save order
        return orderRepository.save(order);
    }


    // GET ALL ORDERS
    public List<Order> getAllOrders() {

        return orderRepository.findAll();
    }


    // GET ORDER BY ID
    public Order getOrderById(Long id) {

        return orderRepository.findById(id).orElse(null);
    }


    
 // UPDATE ORDER
    public Order updateOrder(Long id, Order updatedOrder) {

        Order existingOrder =
                orderRepository.findById(id).orElse(null);

        if (existingOrder == null) {
            return null;
        }

        // Get latest product details
        ProductResponse product;

        try {

            product = productRestClient.get()
                    .uri("/products/{id}",
                            updatedOrder.getProductId())
                    .retrieve()
                    .body(ProductResponse.class);

        } catch (Exception e) {

            e.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Product Service call failed: " + e.getMessage(),
                    e
            );
        }

        // Calculate difference between old and new quantity
        int oldQuantity = existingOrder.getQuantity();
        int newQuantity = updatedOrder.getQuantity();

        int quantityDifference = newQuantity - oldQuantity;

        // If quantity is increased, check available stock
        if (quantityDifference > 0 &&
                quantityDifference > product.getQuantity()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock. Available quantity: "
                            + product.getQuantity()
            );
        }

        // Update product stock
        product.setQuantity(
                product.getQuantity() - quantityDifference
        );

        productRestClient.put()
                .uri("/products/{id}",
                        updatedOrder.getProductId())
                .body(product)
                .retrieve()
                .body(ProductResponse.class);

        // Update order details
        existingOrder.setUserId(
                updatedOrder.getUserId()
        );

        existingOrder.setProductId(
                updatedOrder.getProductId()
        );

        existingOrder.setQuantity(
                newQuantity
        );

        // Calculate total price
        existingOrder.setTotalPrice(
                product.getPrice() * newQuantity
        );

        // Update status only if provided
        if (updatedOrder.getStatus() != null &&
                !updatedOrder.getStatus().isBlank()) {

            existingOrder.setStatus(
                    updatedOrder.getStatus()
            );
        }

        return orderRepository.save(existingOrder);
    }


    // DELETE ORDER
    public boolean deleteOrder(Long id) {

        if (!orderRepository.existsById(id)) {
            return false;
        }

        orderRepository.deleteById(id);

        return true;
    }
}