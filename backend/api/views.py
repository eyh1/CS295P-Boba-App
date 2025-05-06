from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, RestaurantSerializer, ReviewSerializer, RestaurantCategoryRatingSerializer, CategorySerializer, HomeCardSerializer, BookmarkSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Restaurant, Review, Category, ReviewCategoryRating, RestaurantCategoryRating, HomeCard, Bookmark, UserCategoryRating
from django.db.models import Avg, Count
from rest_framework.response import Response
from django.db.models import Q
from collections import defaultdict

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        user_category_ratings = UserCategoryRating.objects.filter(user = user).values_list("restaurant", "category")
        user_category_ratings = set(user_category_ratings)
        print(user_category_ratings)
        q = Q()
        for category, restaurant in user_category_ratings:            
            q |= Q(category=category, restaurant=restaurant)
        other_user_category_ratings = UserCategoryRating.objects.filter(rating__gte=3.5).exclude(user=user).exclude(q)
        
        other_user_category_ratings_dict = defaultdict(set)
        for user_cat_rating in other_user_category_ratings:
            other_user_category_ratings_dict[user_cat_rating.user].add((user_cat_rating.restaurant, user_cat_rating.category))
        print(other_user_category_ratings_dict)
        other_user_jaccard_similarity = {}
        for user, user_category_ratings in other_user_category_ratings_dict.items():
            other_user_jaccard_similarity[user] = len(user_category_ratings.intersection(user_category_ratings)) / len(user_category_ratings.union(user_category_ratings))
        other_user_jaccard_similarity = sorted(other_user_jaccard_similarity.items(), key=lambda x: x[1], reverse=True)
        print(other_user_jaccard_similarity)
        self.recommendations = []
        
        while len(self.recommendations) < 5 and other_user_jaccard_similarity:
            user, _ = other_user_jaccard_similarity.pop(0)
            other_user_category_ratings_set = other_user_category_ratings_dict[user]
            
            for restaurant_category in other_user_category_ratings_set:
                if restaurant_category not in self.recommendations and restaurant_category not in user_category_ratings:
                    self.recommendations.append(restaurant_category)
        print(self.recommendations)
        return self.recommendations

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
                
        return Response({
            'recommended': self.recommendations
        })
        
class GetLatestPositiveReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        rating = 3.5
        latest_positive_reviews =  Review.objects.annotate(avg_rating = Avg('review_category_ratings__rating')).filter(avg_rating__gte=rating, public=True).order_by('-created_at')[:5]
        return latest_positive_reviews
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        data = response.data  
        
        for restaurant in data:
            restaurant.pop('reviews', None)  
        
                
        return Response(data)