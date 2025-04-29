from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, RestaurantSerializer, ReviewSerializer, RestaurantCategoryRatingSerializer, CategorySerializer, HomeCardSerializer, BookmarkSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Restaurant, Review, Category, ReviewCategoryRating, RestaurantCategoryRating, HomeCard, Bookmark, UserCategoryRating
from django.db.models import Avg, Count
from rest_framework.response import Response
from django.db.models import Q

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
class ListRestaurantView(generics.ListAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        categories = self.request.query_params.get('categories', None)
        rating = self.request.query_params.get('rating', 0)
        
        queryset = Restaurant.objects.all()
                
        if categories:
            category_list = categories.split(',')
            
            for category in category_list:
                filter = Q(restaurant_category_ratings__category=category, restaurant_category_ratings__rating__gte=rating)
                queryset = queryset.filter(filter).distinct()

        return queryset

    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        data = response.data  
        
        for restaurant in data:
            restaurant.pop('reviews', None)  
                
        return Response(data)

class CreateReviewView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        restaurant = self.kwargs['restaurantPk']
        user = self.request.user
        restaurant_instance = Restaurant.objects.get(pk=restaurant)
        user_instance = User.objects.get(pk=user.id)
        serializer.save(restaurant=restaurant_instance, user=user_instance)
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return response 

class ListReviewsForRestauarantView(generics.ListAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        restaurant_id = self.kwargs['pk']
        return Restaurant.objects.filter(id=restaurant_id)

class DeleteReviewView(generics.DestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user = self.request.user
        return Review.objects.get(pk=self.kwargs['pk'])

class GetRestaurantCategoryRatingView(generics.RetrieveAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantCategoryRatingSerializer
    permission_classes = [AllowAny]

    def retrieve(self, request, **kwargs):
        restaurant = self.kwargs['restaurantPk']
        category = self.kwargs['categoryPk']
        restaurant_instance = Restaurant.objects.get(pk=restaurant)
        category_instance = Category.objects.get(pk = category)
        review_category_ratings = ReviewCategoryRating.objects.filter(review__restaurant = restaurant_instance)
        average_rating = review_category_ratings.filter(category=self.kwargs["categoryPk"]).aggregate(Avg('rating'))['rating__avg']
        custom_data = {
            'restaurant_name' : restaurant_instance.restaurant_name,
            'category_name' : category_instance.category_name,
            'avg_rating': average_rating
        }

        return Response(custom_data)

class ListCategoryView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    queryset = Category.objects.all()
    

class ListUserReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Review.objects.filter(user=user)

class ListUserBookmarksView(generics.ListAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Bookmark.objects.filter(user=user)
        return queryset
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        data = response.data  
        for bookmark in data:
            bookmark["restaurant"].pop('reviews', None)  
        return Response(data)
    
class CreateBookmarkView(generics.CreateAPIView):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        restaurant = self.kwargs['restaurantPk']
        user = self.request.user
        restaurant_instance = Restaurant.objects.get(pk=restaurant)
        user_instance = User.objects.get(pk=user.id)
        serializer.save(restaurant=restaurant_instance, user=user_instance)
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return response 
    
class ListHomeCardView(generics.ListAPIView):
    serializer_class = HomeCardSerializer
    permission_classes = [AllowAny]
    queryset = HomeCard.objects.all()
    

class DeleteBookmarkView(generics.DestroyAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        return Bookmark.objects.get(pk=self.kwargs['pk'])

class GetRecommendationsView(generics.ListAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        user_category_ratings = UserCategoryRating.objects.filter(user = user)
        top_user_categories = user_category_ratings.values('category').annotate(total = Count('category')).order_by('-total')

        if top_user_categories.count() > 3:
            top_user_categories = top_user_categories[:3]
        
        top_category_ids = [entry['category'] for entry in top_user_categories]
        user_visited_restaurants_ids = user_category_ratings.values_list('restaurant',flat = True)
        user_unvisited_restaurants = Restaurant.objects.exclude(id__in=user_visited_restaurants_ids)
        rating = 4.0
        print("top")
        print(top_category_ids)
        
        filter = Q(restaurant_category_ratings__category__in = top_category_ids, restaurant_category_ratings__rating__gte=rating)
        recommended_restaurants = user_unvisited_restaurants.filter(filter).distinct()
        
        self.top_category_ids = top_category_ids
        print("here")
        print(recommended_restaurants)
        return recommended_restaurants
        
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        data = response.data  
        
        for restaurant in data:
            restaurant.pop('reviews', None)  
        
                
        return Response({
            'recommended_restaurants': data,
            'top_user_categories': self.top_category_ids
        })