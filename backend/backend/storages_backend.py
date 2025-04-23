from storages.backends.s3boto3 import S3Boto3Storage

class ReviewStorage(S3Boto3Storage):
    location = 'reviews'

class RestaurantStorage(S3Boto3Storage):
    location = 'restaurants'

class HomeStorage(S3Boto3Storage):
    location = 'home'