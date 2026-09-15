DISTRICT_TO_CITY = {
    "Surat": "Surat",
    "Rajkot": "Rajkot",
    "Vadodara(Baroda)": "Vadodara",
    "Ahmedabad": "Ahmedabad",
    "Kheda": "Ahmedabad",
    "Porbandar": "Porbandar",
    "Kachchh": "Ahmedabad",
    "Banaskanth": "Ahmedabad",
    "Navsari": "Surat",
    "Anand": "Ahmedabad",
    "Surendranagar": "Rajkot",
    "Bharuch": "Surat",
    "Dahod": "Ahmedabad"
}


def district_to_city(district: str):
    district = district.strip()

    if district in DISTRICT_TO_CITY:
        return DISTRICT_TO_CITY[district]

    return district
