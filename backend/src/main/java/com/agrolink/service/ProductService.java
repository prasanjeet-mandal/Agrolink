package com.agrolink.service;
import com.agrolink.dto.product.*; import java.util.*;
public interface ProductService { ProductResponse create(String email,ProductRequest r); List<ProductResponse> search(String q,Long categoryId); List<ProductResponse> mine(String email); ProductResponse get(Long id); ProductResponse update(String email,Long id,ProductRequest r); void delete(String email,Long id); }
