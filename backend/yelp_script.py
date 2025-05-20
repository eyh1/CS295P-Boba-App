import requests
import uuid
from django.core.files.base import ContentFile
import os
import django
import re

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()


from api.models import Restaurant, RestaurantImage

def sanitize_name(name):
    # Lowercase, replace spaces with underscores, remove non-alphanumerics
    name = name.lower()
    name = re.sub(r'\s+', '_', name)  # Replace spaces/tabs with underscores
    name = re.sub(r'[^a-z0-9_]', '', name)  # Remove non-alphanumeric except underscore
    return name


def download_and_store_image_to_s3(image_url, restaurant):
    try:
        response = requests.get(image_url)
        response.raise_for_status()

        file_ext = image_url.split('.')[-1].split('?')[0][:5]  # crude but effective
        sanitized_name = sanitize_name(restaurant.restaurant_name)
        filename = f"{sanitized_name}_{uuid.uuid4()}.{file_ext}"
        image_content = ContentFile(response.content)

        # Create model instance with image
        img = RestaurantImage(restaurant=restaurant)
        img.image.save(filename, image_content, save=True)

        return img
    except Exception as e:
        print(f"Failed to upload image from {image_url}: {e}")
        return None
    
    

API_KEY = 'flxIoYuXoFqBj29qaNCFF3f7-rK-XyQsITZhSmC-qwo3-IIkP5EnMg4EOwMS76QOJ_PO_uOsfx-jRgT0XabXUsZ_Fs2MYzng3n16z19LmFR2bMIT2VUIm0onUPIraHYx'
HEADERS = {'Authorization': f'Bearer {API_KEY}'}

def fetch_and_save_boba_restaurants():
    print("Fetching boba restaurants from Yelp...")

    # Yelp search API
    search_url = 'https://api.yelp.com/v3/businesses/search'
    params = {
        'term': "boba",
        'location': 'Irvine',
        'limit': 1
    }

    search_response = requests.get(search_url, headers=HEADERS, params=params)
    businesses = search_response.json().get('businesses', [])

    for biz in businesses:
        biz_id = biz['id']
        details_url = f'https://api.yelp.com/v3/businesses/{biz_id}'
        details_response = requests.get(details_url, headers=HEADERS)

        if details_response.status_code != 200:
            print(f"Failed to get details for business ID {biz_id}")
            continue

        data = details_response.json()

        name = data['name']
        address = ", ".join(data['location'].get('display_address', []))
        photos = data.get('photos', [])[:3]
        photos = data.get('photos') or [data.get('image_url')]
        # Avoid duplicates using get_or_create
        restaurant, created = Restaurant.objects.get_or_create(
            restaurant_name=name,
            address=address
        )
        
        for photo_url in photos[:3]:
            download_and_store_image_to_s3(photo_url, restaurant)

        if created:
            print(f"Added: {name} - {address}")
        else:   
            print(f"Exists: {name} - {address}")

        # Save photos if they don't already exist
        for photo_url in photos:
            RestaurantImage.objects.get_or_create(
                restaurant=restaurant,
                image=photo_url
            )

if __name__ == "__main__":
    fetch_and_save_boba_restaurants()