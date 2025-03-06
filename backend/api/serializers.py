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
        fields = ["category_name"]

class ReviewCategoryRatingSerializer(serializers.ModelSerializer):
    # category = serializers.SlugRelatedField(slug_field='category_name', queryset=Category.objects.all())
    class Meta:
        model = ReviewCategoryRating
        fields = ["category", "rating"]

class ReviewSerializer(serializers.ModelSerializer):
    restaurant = serializers.PrimaryKeyRelatedField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    review_category_ratings = ReviewCategoryRatingSerializer(many=True)

    class Meta:
        model = Review
        fields = ['id', 'content', 'created_at', 'user', 'restaurant', 'anonymous', 'pricing', 'sweetness', 'review_category_ratings']
    
    def create(self, validated_data):
        category_ratings_data = validated_data.pop('review_category_ratings')
        review = Review.objects.create(**validated_data)
        for category_rating_data in category_ratings_data:
            ReviewCategoryRating.objects.create(review=review, **category_rating_data)
        return review    

class RestaurantSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    class Meta:
        model = Restaurant
        fields = ["id", "restaurant_name", "address", "reviews"]

class RestaurantCategoryRatingSerializer(serializers.Serializer):
    class Meta:
        fields = ["restaurant_name", "category_name", "avg_rating"]

