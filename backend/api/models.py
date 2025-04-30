from django.db import models
from django.contrib.auth.models import User
from backend.storages_backend import RestaurantStorage, ReviewStorage, HomeStorage

# Create your models here.

class HomeCard(models.Model):
    message = models.CharField(max_length=200)
    image = models.ImageField(storage=HomeStorage(), upload_to='')
    categories = models.ManyToManyField('Category', related_name='home_cards', blank=True)
    rating = models.DecimalField(max_digits = 3, decimal_places = 2)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(rating__gte=0, rating__lte=5),
                name='home_card_rating_between_0_and_5'
            )        ]
        
class Restaurant(models.Model):
    restaurant_name = models.CharField(max_length=120)
    address = models.CharField(max_length=200)
    image = models.ImageField(storage=RestaurantStorage(), upload_to='')
    
    class Meta:
        unique_together = ["restaurant_name", "address"]
    
    def __str__(self):
        return self.restaurant_name + ", " + self.address

class Review(models.Model):
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews",null = True, blank = True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="reviews")
    public = models.BooleanField(default = False)
    pricing = models.FloatField()
    sweetness = models.FloatField()

class Category(models.Model):
    ALLOWED_CATEGORY_TYPES = [
        {'base','Base'},
        {'topping', 'Topping'}
    ]
    category_name = models.CharField(max_length = 100, unique = True)
    category_type = models.CharField(max_length = 100, choices = ALLOWED_CATEGORY_TYPES, default = "base")

class ReviewCategoryRating(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='review_category_ratings')
    rating = models.DecimalField(max_digits = 3, decimal_places = 2)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(rating__gte=0, rating__lte=5),
                name='rating_between_0_and_5'
            )        ]
    
class RestaurantCategoryRating(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="restaurant_category_ratings")
    rating = models.DecimalField(max_digits = 3, decimal_places = 2)

    class Meta:
        unique_together = ["restaurant", "category"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(rating__gte=0, rating__lte=5),
                name='restaurant_rating_between_0_and_5'
            )  ]
        
class UserCategoryRating(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_category_ratings')
    rating = models.DecimalField(max_digits = 3, decimal_places = 2)

    class Meta:
        unique_together = ["user", "restaurant", "category"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(rating__gte=0, rating__lte=5),
                name='user_rating_between_0_and_5'
            )  ]
        
        
class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='bookmarks')
    
    class Meta:
        unique_together = ["user", "restaurant"]