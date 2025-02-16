from django.db import models

# Create your models here.

class Restaurant(models.Model):
    restaurant_name = models.CharField(max_length=120)
    address = models.CharField(max_length=200)
    
    def __str__(self):
        return self.restaurant_name + ", " + self.address