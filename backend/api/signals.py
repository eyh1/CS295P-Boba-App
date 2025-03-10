from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import ReviewCategoryRating, Review, Category, UserCategoryRating
from django.db.models import Avg
from django.db import transaction

@receiver(post_save, sender=ReviewCategoryRating)
def update_user_category_rating_on_review_create(sender, instance, **kwargs):
    review = instance.review
    user = review.user
    restaurant = review.restaurant
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
    
    

@receiver(pre_delete, sender=Review)
def update_user_category_rating_on_review_delete(sender, instance, **kwargs):
    """
    Signal to update the product rating when a review is deleted.
    """
    user = instance.user
    restaurant = instance.restaurant
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
