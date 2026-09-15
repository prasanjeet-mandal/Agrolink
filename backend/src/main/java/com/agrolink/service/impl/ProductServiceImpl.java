package com.agrolink.service.impl;
import com.agrolink.dto.product.*; import com.agrolink.entity.*; import com.agrolink.enums.*; import com.agrolink.repository.*; import com.agrolink.service.ProductService;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.*;
@Service public class ProductServiceImpl implements ProductService {
 private final ProductRepository products; private final CategoryRepository cats; private final UserRepository users;
 public ProductServiceImpl(ProductRepository p,CategoryRepository c,UserRepository u){products=p;cats=c;users=u;}
 @Transactional public ProductResponse create(String email,ProductRequest r){User u=user(email); if(u.getRole()!=Role.FARMER&&u.getRole()!=Role.FPO)throw new RuntimeException("Only FARMER or FPO can list products"); Category c=cats.findById(r.categoryId()).orElseThrow(()->new RuntimeException("Category not found")); Product p=new Product();p.setSeller(u);p.setCategory(c);set(p,r);return to(products.save(p));}
 @Transactional(readOnly=true) public List<ProductResponse> search(String q,Long categoryId){List<Product> l;if(categoryId!=null)l=products.findByCategoryId(categoryId);else if(q!=null&&!q.isBlank())l=products.search(q,ProductStatus.ACTIVE);else l=products.findByStatus(ProductStatus.ACTIVE);return l.stream().filter(p->p.getStatus()==ProductStatus.ACTIVE).map(this::to).toList();}
 @Transactional(readOnly=true) public List<ProductResponse> mine(String email){return products.findBySellerEmail(email).stream().map(this::to).toList();}
 @Transactional(readOnly=true) public ProductResponse get(Long id){return to(products.findById(id).orElseThrow(()->new RuntimeException("Product not found")));}
 @Transactional public ProductResponse update(String email,Long id,ProductRequest r){Product p=products.findById(id).orElseThrow(()->new RuntimeException("Product not found"));owner(p,email);p.setCategory(cats.findById(r.categoryId()).orElseThrow(()->new RuntimeException("Category not found")));set(p,r);return to(products.save(p));}
 @Transactional public void delete(String email,Long id){Product p=products.findById(id).orElseThrow(()->new RuntimeException("Product not found"));owner(p,email);p.setStatus(ProductStatus.INACTIVE);products.save(p);}
 private void set(Product p,ProductRequest r){p.setName(r.name());p.setDescription(r.description());p.setPrice(r.price());p.setUnit(r.unit());p.setAvailableQuantity(r.availableQuantity());p.setImageUrl(r.imageUrl());p.setLocation(r.location());p.setLatitude(r.latitude());p.setLongitude(r.longitude());p.setStatus(ProductStatus.ACTIVE);}
 private User user(String e){return users.findByEmail(e).orElseThrow(()->new RuntimeException("User not found"));}
 private void owner(Product p,String e){if(!p.getSeller().getEmail().equals(e))throw new RuntimeException("You cannot modify this product");}
 private ProductResponse to(Product p){return new ProductResponse(p.getId(),p.getSeller().getId(),p.getSeller().getFullName(),p.getCategory().getId(),p.getCategory().getName(),p.getName(),p.getDescription(),p.getPrice(),p.getUnit(),p.getAvailableQuantity(),p.getImageUrl(),p.getLocation(),p.getLatitude(),p.getLongitude(),p.getStatus().name(),p.getSeller().getRole().name());}
}
