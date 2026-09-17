package com.agrolink.config;

import com.agrolink.entity.Address;
import com.agrolink.entity.Category;
import com.agrolink.entity.DeliveryPartnerProfile;
import com.agrolink.entity.Farmer;
import com.agrolink.entity.Fpo;
import com.agrolink.entity.Product;
import com.agrolink.entity.User;
import com.agrolink.entity.Vehicle;
import com.agrolink.enums.ProductStatus;
import com.agrolink.enums.Role;
import com.agrolink.repository.AddressRepository;
import com.agrolink.repository.CategoryRepository;
import com.agrolink.repository.DeliveryPartnerProfileRepository;
import com.agrolink.repository.FarmerRepository;
import com.agrolink.repository.FpoRepository;
import com.agrolink.repository.ProductRepository;
import com.agrolink.repository.UserRepository;
import com.agrolink.repository.VehicleRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final CategoryRepository categories;
    private final AddressRepository addresses;
    private final FarmerRepository farmers;
    private final FpoRepository fpos;
    private final VehicleRepository vehicles;
    private final ProductRepository products;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfiles;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository users,
            CategoryRepository categories,
            AddressRepository addresses,
            FarmerRepository farmers,
            FpoRepository fpos,
            VehicleRepository vehicles,
            ProductRepository products,
            DeliveryPartnerProfileRepository deliveryPartnerProfiles,
            PasswordEncoder passwordEncoder
    ) {
        this.users = users;
        this.categories = categories;
        this.addresses = addresses;
        this.farmers = farmers;
        this.fpos = fpos;
        this.vehicles = vehicles;
        this.products = products;
        this.deliveryPartnerProfiles = deliveryPartnerProfiles;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (users.count() == 0) {
            seedCategories();

            Map<String, User> byEmail = seedUsers();

            seedAddresses(byEmail);

            System.out.println(
                    "[AGROLINK-SEED] demo data created — "
                            + "login with meera@example.com / secret (consumer), "
                            + "harpreet@example.com / secret (farmer), "
                            + "fpo.punjab@example.com / secret (FPO), "
                            + "dp.gurmeet@example.com / secret (delivery partner), "
                            + "admin@example.com / secret (admin)"
            );
        }

        seedProducerProfiles();

        seedProducts();

        seedVehicles();

        seedDeliveryPartner();

        seedAdmin();

    }

    private void seedVehicles() {

        if (vehicles.count() > 0) {
            return;
        }

        Object[][] rows = {
                { "Tata 407", "PB-12-4567", "Sandeep Gill", "9855112233", "AVAILABLE" },
                { "Eicher Pro 3015", "PB-41-8890", "Jaspreet Kaur", "9814702100", "AVAILABLE" },
                { "Mahindra Bolero Pickup", "PB-07-3345", "Gurpreet Singh", "9417788990", "ASSIGNED" },
                { "Ashok Leyland Dost+", "MH-14-2211", "Rahul Pawar", "9890400011", "MAINTENANCE" },
                { "TVS King", "KA-01-7788", "Kiran Kumar", "9986004455", "AVAILABLE" },
        };

        for (Object[] row : rows) {
            Vehicle v = new Vehicle();
            v.setType((String) row[0]);
            v.setPlate((String) row[1]);
            v.setDriverName((String) row[2]);
            v.setDriverPhone((String) row[3]);
            v.setStatus((String) row[4]);
            vehicles.save(v);
        }
    }

    private void seedDeliveryPartner() {

        User user = seedUserIfMissing("Gurmeet Sandhu", "dp.gurmeet@example.com", Role.DELIVERY_PARTNER);

        if (deliveryPartnerProfiles.findByUserId(user.getId()).isEmpty()) {
            DeliveryPartnerProfile profile = new DeliveryPartnerProfile();
            profile.setUser(user);
            profile.setVehicleNumber("PB-10-DP-4711");
            profile.setDrivingLicense("DL-042019-007654");
            deliveryPartnerProfiles.save(profile);
        }
    }

    private void seedAdmin() {

        seedUserIfMissing("Agrolink Admin", "admin@example.com", Role.ADMIN);
    }

    private User seedUserIfMissing(String name, String email, Role role) {

        return users.findByEmail(email).orElseGet(() ->
                users.save(new User(name, email, passwordEncoder.encode("secret"), role)));
    }

    private void seedProducerProfiles() {

        if (farmers.count() > 0 && fpos.count() > 0) {
            return;
        }

        User harpreet = users.findByEmail("harpreet@example.com").orElse(null);
        User ramesh = users.findByEmail("ramesh@example.com").orElse(null);
        User lakshmi = users.findByEmail("lakshmi@example.com").orElse(null);
        User fpoPunjab = users.findByEmail("fpo.punjab@example.com").orElse(null);
        User fpoSahyadri = users.findByEmail("fpo.sahyadri@example.com").orElse(null);

        if (harpreet != null && farmers.count() == 0) {
            saveFarmer(harpreet, "9814001101", "Borala", "Ludhiana", "Punjab", "141401", "12 years");
            saveFarmer(ramesh, "9839121212", "Rura", "Kanpur", "Uttar Pradesh", "208023", "8 years");
            saveFarmer(lakshmi, "9740233456", "Kolar", "Bengaluru Rural", "Karnataka", "562101", "10 years");
        }

        if (fpoPunjab != null && fpos.count() == 0) {
            saveFpo(fpoPunjab, "Punjab Agri FPO", "AGFPO-7261", "01612002121",
                    "Ludhiana", "Ludhiana", "Punjab", "141001",
                    "Farmer producer organisation aggregating 1,200+ smallholder farmers across Punjab.");
            saveFpo(fpoSahyadri, "Sahyadri Farmers Co-op", "AGFPO-7103", "02029110000",
                    "Pune", "Pune", "Maharashtra", "411001",
                    "Cooperative of grape, tomato and dairy farmers from the Sahyadri belt.");
        }
    }

    private void seedProducts() {

        if (products.count() > 0) {
            return;
        }

        User harpreet = users.findByEmail("harpreet@example.com").orElse(null);
        User ramesh = users.findByEmail("ramesh@example.com").orElse(null);
        User lakshmi = users.findByEmail("lakshmi@example.com").orElse(null);
        User fpoPunjab = users.findByEmail("fpo.punjab@example.com").orElse(null);
        User fpoSahyadri = users.findByEmail("fpo.sahyadri@example.com").orElse(null);

        Category grains = categories.findByNameIgnoreCase("Grains & Pulses").orElse(null);
        Category oilseeds = categories.findByNameIgnoreCase("Oilseeds").orElse(null);
        Category vegetables = categories.findByNameIgnoreCase("Vegetables").orElse(null);
        Category fruits = categories.findByNameIgnoreCase("Fruits").orElse(null);
        Category spices = categories.findByNameIgnoreCase("Spices").orElse(null);
        Category dairy = categories.findByNameIgnoreCase("Dairy").orElse(null);

        Object[][] rows = {
            // id  name                            seller       category   price    unit     qty   location
            { 1,  "Basmati Rice (Premium)",        fpoPunjab,   grains,    145.00,  "kg",    1200.0, "Ludhiana, Punjab" },
            { 2,  "Mustard Oil (Kachi Ghani)",     fpoPunjab,   oilseeds,  210.00,  "litre",  400.0, "Ludhiana, Punjab" },
            { 3,  "Sharbati Wheat",                fpoPunjab,   grains,    3200.00, "quintal", 320.0, "Ludhiana, Punjab" },
            { 4,  "Fresh Potatoes",                ramesh,      vegetables,  28.00, "kg",    8000.0, "Kanpur, Uttar Pradesh" },
            { 5,  "Organic Wheat Flour (Atta)",    harpreet,    grains,      62.00, "kg",    1500.0, "Ludhiana, Punjab" },
            { 6,  "Tomatoes (Ripe Gassed-free)",   fpoSahyadri, vegetables,  34.00, "kg",    5000.0, "Pune, Maharashtra" },
            { 7,  "Thompson Seedless Grapes",      fpoSahyadri, fruits,      90.00, "kg",    1200.0, "Pune, Maharashtra" },
            { 8,  "Onions (Red)",                  fpoSahyadri, vegetables,  22.00, "kg",    9000.0, "Pune, Maharashtra" },
            { 9,  "Organic Turmeric Powder",       lakshmi,     spices,     380.00, "kg",     160.0, "Bengaluru Rural, Karnataka" },
            { 10, "Ragi (Finger Millet)",          lakshmi,     grains,      48.00, "kg",     600.0, "Bengaluru Rural, Karnataka" },
            { 11, "Fresh Tomatoes (Cherry)",       lakshmi,     vegetables,  58.00, "kg",     350.0, "Bengaluru Rural, Karnataka" },
            { 12, "Yellow Mustard Seeds",          harpreet,    oilseeds,    84.00, "kg",     900.0, "Ludhiana, Punjab" },
            { 13, "Fresh Cow Milk (Bulk)",         fpoSahyadri, dairy,       46.00, "litre",  500.0, "Pune, Maharashtra" },
            { 14, "Groundnut Kernels",             harpreet,    oilseeds,   118.00, "kg",     700.0, "Ludhiana, Punjab" },
            { 15, "Turmeric Finger (Raw)",         lakshmi,     spices,      92.00, "kg",     800.0, "Bengaluru Rural, Karnataka" },
        };

        for (Object[] row : rows) {
            Product p = new Product();
            p.setSeller((User) row[2]);
            p.setCategory((Category) row[3]);
            p.setName((String) row[1]);
            p.setPrice(BigDecimal.valueOf((Double) row[4]));
            p.setUnit((String) row[5]);
            p.setAvailableQuantity((Double) row[6]);
            p.setLocation((String) row[7]);
            p.setStatus(ProductStatus.ACTIVE);
            products.save(p);
        }

        System.out.println("[AGROLINK-SEED] 15 demo products created for the home page");
    }

    private void saveFarmer(User user, String phone, String village, String district, String state, String pincode, String experience) {

        if (user == null || farmers.existsByUserId(user.getId())) {
            return;
        }
        Farmer f = new Farmer();
        f.setUser(user);
        f.setPhone(phone);
        f.setVillage(village);
        f.setDistrict(district);
        f.setState(state);
        f.setPincode(pincode);
        f.setExperience(experience);
        farmers.save(f);
    }

    private void saveFpo(User user, String orgName, String regNo, String phone, String village, String district, String state, String pincode, String description) {

        if (user == null || fpos.existsByUserId(user.getId())) {
            return;
        }
        Fpo f = new Fpo();
        f.setUser(user);
        f.setOrganizationName(orgName);
        f.setRegistrationNumber(regNo);
        f.setPhone(phone);
        f.setVillage(village);
        f.setDistrict(district);
        f.setState(state);
        f.setPincode(pincode);
        f.setDescription(description);
        fpos.save(f);
    }

    private void seedCategories() {

        String[][] rows = {
                { "Grains & Pulses", "Cereals, rice, wheat, millets and pulses" },
                { "Oilseeds", "Mustard, groundnut, sesame and other oilseeds" },
                { "Vegetables", "Fresh seasonal vegetables" },
                { "Fruits", "Fresh fruits" },
                { "Spices", "Turmeric, chilli and other spices" },
                { "Dairy", "Milk and dairy products" },
        };

        for (String[] row : rows) {
            if (categories.existsByNameIgnoreCase(row[0])) {
                continue;
            }
            Category c = new Category();
            c.setName(row[0]);
            c.setDescription(row[1]);
            categories.save(c);
        }
    }

    private Map<String, User> seedUsers() {

        Object[][] rows = {
                { "Meera Sharma", "meera@example.com", Role.CONSUMER },
                { "Amit Patel", "amit@example.com", Role.CONSUMER },
                { "Harpreet Singh", "harpreet@example.com", Role.FARMER },
                { "Ramesh Kumar", "ramesh@example.com", Role.FARMER },
                { "Lakshmi Reddy", "lakshmi@example.com", Role.FARMER },
                { "Punjab Agri FPO", "fpo.punjab@example.com", Role.FPO },
                { "Sahyadri Farmers Co-op", "fpo.sahyadri@example.com", Role.FPO },
        };

        Map<String, User> result = new LinkedHashMap<>();

        for (Object[] row : rows) {
            User u = new User(
                    (String) row[0],
                    (String) row[1],
                    passwordEncoder.encode("secret"),
                    (Role) row[2]
            );
            result.put((String) row[1], users.save(u));
        }

        return result;
    }

    private void seedAddresses(Map<String, User> byEmail) {

        User meera = byEmail.get("meera@example.com");
        User amit = byEmail.get("amit@example.com");

        saveAddress(meera, "12, Green Park", "Hauz Khas", "Delhi", "Delhi", "Delhi", "110016", "HOME");
        saveAddress(amit, "8A, Hill Road", "Bandra West", "Mumbai", "Mumbai", "Maharashtra", "400050", "HOME");
    }

    private void saveAddress(User user, String line, String village, String city, String district, String state, String pincode, String type) {

        Address a = new Address();
        a.setUser(user);
        a.setAddressLine(line);
        a.setVillage(village);
        a.setCity(city);
        a.setDistrict(district);
        a.setState(state);
        a.setPincode(pincode);
        a.setAddressType(type);
        addresses.save(a);
    }
}