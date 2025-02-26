from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, RestaurantSerializer, ReviewSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Restaurant, Review

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
class ListRestaurantView(generics.ListAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    queryset = Restaurant.objects.all()

class CreateReviewView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        restaurant = self.kwargs.get('restaurantPk')
        user = self.kwargs.get('userPk')
        restaurant_instance = Restaurant.objects.get(pk=restaurant)
        serializer.save(restaurant=restaurant_instance)
        if user:
            print(user)
            user_instance = User.objects.get(pk=user)
            serializer.save(user=user_instance)
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return response 

class ListReviewsForRestauarantView(generics.ListAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        restaurant_id = self.kwargs['pk']
        return Restaurant.objects.filter(id=restaurant_id)
