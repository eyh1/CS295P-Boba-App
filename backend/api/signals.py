from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ReviewCategoryRating
from django.db import transaction

@receiver(post_save, sender=Review)
def update_user_category_rating_on_review_create(sender, instance, created, **kwargs):
    if created:  
        user = instance.user
        # grab all the review_category_ratings for each     
        review_category_ratings = user.reviews.all()
        average_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
        book.rating = average_rating or 0  # Default to 0 if no reviews
        book.save()