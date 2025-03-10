from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import ReviewCategoryRating, Review, Category, UserCategoryRating, RestaurantCategoryRating
from django.db.models import Avg
from django.db import transaction

@receiver(post_save, sender=ReviewCategoryRating)
def update_category_ratings_on_review_create(sender, instance, **kwargs):
    review = instance.review
    user = review.user
    restaurant = review.restaurant
    
    update_user_category_on_update(review, user, restaurant)
    
    update_restaurant_category_on_update(review, restaurant)
    
@receiver(pre_delete, sender=Review)
def update_category_ratings_on_review_delete(sender, instance, **kwargs):
    """
    Signal to update the product rating when a review is deleted.
    """
    user = instance.user
    restaurant = instance.restaurant
    
    update_user_category_on_delete(instance, user, restaurant)
    
    update_restaurant_category_on_delete(instance, restaurant)    

def update_user_category_on_update(review, user, restaurant):
    avg_user_rating_for_category = None
    for rating in ReviewCategoryRating.objects.filter(review = review):
        category = rating.category
        avg_user_rating_for_category = ReviewCategoryRating.objects.filter(category = category, review__user = user, review__restaurant = restaurant).aggregate(Avg('rating'))['rating__avg']
        if avg_user_rating_for_category:
            avg_user_rating_for_category = round(avg_user_rating_for_category, 2)
        try: 
            user_category_rating = UserCategoryRating.objects.get(user = user, category = category, restaurant = restaurant)
            user_category_rating.rating = avg_user_rating_for_category
            user_category_rating.save()
        except UserCategoryRating.DoesNotExist:
            # couldn't find user_category_rating, creating a new one
            user_category_rating = UserCategoryRating.objects.create(category = category, restaurant = restaurant, user = user, rating = avg_user_rating_for_category)
    
def update_restaurant_category_on_update(review, restaurant):
    avg_restaurant_rating_for_category = None
    for rating in ReviewCategoryRating.objects.filter(review = review):
        category = rating.category
        avg_restaurant_rating_for_category = UserCategoryRating.objects.filter(category = category, restaurant = restaurant).aggregate(Avg('rating'))['rating__avg']
        if avg_restaurant_rating_for_category:
            avg_restaurant_rating_for_category = round(avg_restaurant_rating_for_category, 2)
        try: 
            restaurant_category_rating = RestaurantCategoryRating.objects.get(category = category, restaurant = restaurant)
            restaurant_category_rating.rating = avg_restaurant_rating_for_category
            restaurant_category_rating.save()
        except RestaurantCategoryRating.DoesNotExist:
            # couldn't find user_category_rating, creating a new one
            restaurant_category_rating = RestaurantCategoryRating.objects.create(category = category, restaurant = restaurant, rating = avg_restaurant_rating_for_category)
    
def update_user_category_on_delete(instance, user, restaurant):
    avg_user_rating_for_category = None
    for rating in ReviewCategoryRating.objects.filter(review = instance):
        category = rating.category
        avg_user_rating_for_category = ReviewCategoryRating.objects.filter(category = category, review__user = user, review__restaurant = restaurant).exclude(id = rating.id).aggregate(Avg('rating'))['rating__avg']
        try: 
            user_category_rating = UserCategoryRating.objects.get(user = user, category = category, restaurant = restaurant)
            
            num_ratings = ReviewCategoryRating.objects.filter(category = category, review__user = user, review__restaurant = restaurant).count()
            if num_ratings > 1:
                avg_user_rating_for_category = round(avg_user_rating_for_category, 2)
                user_category_rating.rating = avg_user_rating_for_category
                user_category_rating.save()
            else:
                user_category_rating.delete()
        except UserCategoryRating.DoesNotExist:
            # couldn't find user_category_rating, creating a new one
            #this shouldnt happen on deleting but im keeping it here anyway
            user_category_rating = UserCategoryRating.objects.create(category = category, restaurant = restaurant, user = user)


def update_restaurant_category_on_delete(instance, restaurant):
    avg_restaurant_rating_for_category = None
    for rating in ReviewCategoryRating.objects.filter(review = instance):
        category = rating.category
        avg_restaurant_rating_for_category = UserCategoryRating.objects.filter(category = category, restaurant = restaurant).aggregate(Avg('rating'))['rating__avg']
        try: 
            restaurant_category_rating = RestaurantCategoryRating.objects.get(category = category, restaurant = restaurant)
            num_ratings = UserCategoryRating.objects.filter(category = category, restaurant = restaurant).count()
            if num_ratings > 0:
                avg_restaurant_rating_for_category = round(avg_restaurant_rating_for_category, 2)
                restaurant_category_rating.rating = avg_restaurant_rating_for_category
                restaurant_category_rating.save()
            else:
                restaurant_category_rating.delete()
        except RestaurantCategoryRating.DoesNotExist:
            # couldn't find user_category_rating, creating a new one
            restaurant_category_rating = RestaurantCategoryRating.objects.create(category = category, restaurant = restaurant, rating = avg_restaurant_rating_for_category)
    