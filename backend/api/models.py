from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Restaurant(models.Model):
    restaurant_name = models.CharField(max_length=120)
    address = models.CharField(max_length=200)
    
    def __str__(self):
        return self.restaurant_name + ", " + self.address

class Review(models.Model):
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="reviews")
    anonymous = models.BooleanField(default = True)
    pricing = models.FloatField()
    sweetness = models.FloatField()

    