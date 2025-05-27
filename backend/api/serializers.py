from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Restaurant, Review, ReviewCategoryRating, Category, RestaurantCategoryRating, HomeCard, Bookmark, RestaurantImage

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
        fields = ["id", "category_name", "category_type"]

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

class RestaurantListSerializer(serializers.ModelSerializer):
    restaurant_category_ratings = serializers.SerializerMethodField()
    restaurant_image = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = ["id", "restaurant_name", "address", "lat", "lng", "restaurant_category_ratings", "restaurant_image", "distance"]

    def get_restaurant_category_ratings(self, obj):
        restaurant_category_ratings = obj.restaurant_category_ratings.all()
        return RestaurantCategoryRatingSerializer(restaurant_category_ratings, many=True, read_only=True).data
    
    def get_restaurant_image(self, obj):
        restaurant_image = obj.restaurant_images.first()
        return RestaurantImageSerializer(restaurant_image, read_only=True).data
    
    def get_distance(self, obj):
        lat = self.context.get('lat')
        lng = self.context.get('lng')
        if lat is None or lng is None:
            return None
        return round(getattr(obj, 'distance', None), 2)
    
class RestaurantSerializer(serializers.ModelSerializer):
    restaurant_category_ratings = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    restaurant_images = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = ["id", "restaurant_name", "address", "reviews", "restaurant_category_ratings", "restaurant_images"]
      
    def get_reviews(self, obj):
        reviews = obj.reviews.filter(public = True)  
        return ReviewSerializer(reviews, many=True, read_only=True).data
    
    def get_restaurant_category_ratings(self, obj):
        restaurant_category_ratings = obj.restaurant_category_ratings.all()
        return RestaurantCategoryRatingSerializer(restaurant_category_ratings, many=True, read_only=True).data
    
    def get_restaurant_images(self, obj):
        restaurant_images = obj.restaurant_images.all()
        return RestaurantImageSerializer(restaurant_images, many=True, read_only=True).data

class RestaurantImageSerializer(serializers.ModelSerializer):
    restaurant = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = RestaurantImage
        fields = ["id", "restaurant", "image"]
        
class RestaurantCategoryRatingSerializer(serializers.ModelSerializer):
    restaurant = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(read_only=True)
    restaurant_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    
    class Meta:
        model = RestaurantCategoryRating
        fields = ["id", "restaurant", "restaurant_name", "category", "category_name", "rating"]

    def get_restaurant_name(self, obj):
        return obj.restaurant.restaurant_name

    def get_category_name(self, obj):
        return obj.category.category_name

class HomeCardSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()
    
    class Meta:
        model = HomeCard
        fields = ["id", "message", "image", "categories", "rating"]

    def get_categories(self, obj):
        return [category.id for category in obj.categories.all()]

class BookmarkSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    restaurant = RestaurantSerializer(read_only=True)
    
    class Meta:
        model = Bookmark
        fields = ["id", "user", "restaurant"]
        
class RecommendedRestaurantSerializer(serializers.Serializer):
    
    restaurant = RestaurantSerializer(read_only=True)
