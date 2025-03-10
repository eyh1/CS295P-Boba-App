from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Restaurant, Review, ReviewCategoryRating, Category

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "category_name"]

class ReviewCategoryRatingSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    class Meta:
        model = ReviewCategoryRating
        fields = ["category", "category_name", "rating"]

    def get_category_name(self, obj):
        return obj.category.category_name

class ReviewSerializer(serializers.ModelSerializer):
    restaurant = serializers.PrimaryKeyRelatedField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    review_category_ratings = ReviewCategoryRatingSerializer(many=True)
    username = serializers.SerializerMethodField()
    restaurant_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'content', 'created_at', 'user', 'username', 'restaurant', 'restaurant_name', 'public', 'pricing', 'sweetness', 'review_category_ratings']
    
    def create(self, validated_data):
        category_ratings_data = validated_data.pop('review_category_ratings')
        review = Review.objects.create(**validated_data)
        for category_rating_data in category_ratings_data:
            ReviewCategoryRating.objects.create(review=review, **category_rating_data)
        return review    
    
    def get_username(self, obj):
        return obj.user.username if obj.user else None

    def get_restaurant_name(self, obj):
        return obj.restaurant.restaurant_name
    
class RestaurantSerializer(serializers.ModelSerializer):
    reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = ["id", "restaurant_name", "address", "reviews"]
      
    def get_reviews(self, obj):
        reviews = obj.reviews.filter(public = True)  
        return ReviewSerializer(reviews, many=True, read_only=True).data
    
class RestaurantCategoryRatingSerializer(serializers.Serializer):
    class Meta:
        fields = ["restaurant_name", "category_name", "avg_rating"]

