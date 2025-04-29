"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, ListRestaurantView, CreateReviewView, ListReviewsForRestauarantView
from api.views import DeleteReviewView, GetRestaurantCategoryRatingView, ListCategoryView, ListUserReviewsView
from api.views import ListHomeCardView, ListUserBookmarksView, CreateBookmarkView, DeleteBookmarkView, GetRecommendationsView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/restaurants/", ListRestaurantView.as_view(), name="get_restaurants"),
    path("api/homeCards/", ListHomeCardView.as_view(), name="get_home_cards"),
    path("api/review/<int:restaurantPk>/create/", CreateReviewView.as_view(), name="create_review"),
    path("api/review/<int:pk>/delete/", DeleteReviewView.as_view(), name="delete_review"),
    path('api/restaurant/<int:pk>/reviews/', ListReviewsForRestauarantView.as_view(), name='get_restaurant_reviews'),
    path('api/restaurant/<int:restaurantPk>/<str:categoryPk>/retrieve', GetRestaurantCategoryRatingView.as_view(), name = 'get_restaurant_category_rating'),
    path("api/category/", ListCategoryView.as_view(), name="get_categories"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path('api/users/reviews/', ListUserReviewsView.as_view(), name='list_user_reviews'),
    path('api/users/bookmarks/', ListUserBookmarksView.as_view(), name='list_user_bookmarks'),
    path("api/bookmark/<int:restaurantPk>/create/", CreateBookmarkView.as_view(), name="createBookmark"),
    path("api/bookmark/<int:pk>/delete/", DeleteBookmarkView.as_view(), name="delete_bookmark"),
    path("api/users/fyp/", GetRecommendationsView.as_view(), name="get_recommendations"),
    path("api-auth/", include("rest_framework.urls"))]
