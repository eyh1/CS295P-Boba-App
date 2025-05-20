import requests
import uuid
from django.core.files.base import ContentFile
import os
import django
import re


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()


from django.contrib.auth.models import User
from api.models import Restaurant, Review, ReviewCategoryRating, Category, RestaurantCategoryRating, HomeCard, Bookmark, RestaurantImage
import random



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
        print(f"Uploaded: {filename}")
        return img
    except Exception as e:
        print(f"Failed to upload image from {image_url}: {e}")
        raise e
    
    

API_KEY = YELP_API_KEY
HEADERS = {'Authorization': f'Bearer {API_KEY}'}

def fetch_and_save_boba_restaurants():
    print("Fetching boba restaurants from Yelp...")

    # Yelp search API
    search_url = 'https://api.yelp.com/v3/businesses/search'
    params = {
        'term': "Omomo",
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
        
def delete_external_images():
    images_to_delete = RestaurantImage.objects.filter(image__startswith="https")

    total = images_to_delete.count()
    print(f"Found {total} external image(s) to delete...")

    for img in images_to_delete:
        print(f"Deleting image with URL: {img.image}")
        img.delete()

    print("Done.")
    
def generate_random_reviews():
    users = User.objects.all()
    bases = Category.objects.filter(category_type="Base")
    toppings = Category.objects.filter(category_type="Topping")
    restaurants = Restaurant.objects.all()
    for restaurant in restaurants:
        for _ in range(5):
            user = users.order_by('?').first()
            content = "This is a random review."
            #random number between 5 and 10
            pricing = random.randint(5, 10)
            sweetness = random.choice(range(0, 126, 25))
            public = True

            review = Review.objects.create(
                content=content,
                user=user,
                restaurant=restaurant,
                public=public,
                pricing=pricing,
                sweetness=sweetness
            )

            # Randomly assign categories to the review
            category = bases.order_by('?').first()
            rating = 4.0
            ReviewCategoryRating.objects.create(
                review=review,
                category=category,
                rating=rating
            )
            category = toppings.order_by('?').first()
            rating = 4.0
            ReviewCategoryRating.objects.create(
                review=review,
                category=category,
                rating=rating
            )

if __name__ == "__main__":
    # fetch_and_save_boba_restaurants()
    # delete_external_images()
    generate_random_reviews()