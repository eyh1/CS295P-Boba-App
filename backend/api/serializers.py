from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Restaurant, Review

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user
        
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'content', 'created_at', 'author', 'restaurant', 'anonymous', 'pricing', 'sweetness']
        

class RestaurantSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    class Meta:
        model = Restaurant
        fields = ["id", "restaurant_name", "address", "reviews"]

