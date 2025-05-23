# Generated by Django 5.1.7 on 2025-05-20 20:27

import backend.storages_backend
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category_name', models.CharField(max_length=100, unique=True)),
                ('category_type', models.CharField(choices=[('base', 'Base'), ('topping', 'Topping')], default='base', max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Restaurant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('restaurant_name', models.CharField(max_length=120)),
                ('address', models.CharField(max_length=200)),
            ],
            options={
                'unique_together': {('restaurant_name', 'address')},
            },
        ),
        migrations.CreateModel(
            name='RestaurantImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(blank=True, null=True, storage=backend.storages_backend.RestaurantStorage(), upload_to='')),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='restaurant_images', to='api.restaurant')),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('public', models.BooleanField(default=False)),
                ('pricing', models.FloatField()),
                ('sweetness', models.FloatField()),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='api.restaurant')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='HomeCard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.CharField(max_length=200)),
                ('image', models.ImageField(storage=backend.storages_backend.HomeStorage(), upload_to='')),
                ('rating', models.DecimalField(decimal_places=2, max_digits=3)),
                ('categories', models.ManyToManyField(blank=True, related_name='home_cards', to='api.category')),
            ],
            options={
                'constraints': [models.CheckConstraint(condition=models.Q(('rating__gte', 0), ('rating__lte', 5)), name='home_card_rating_between_0_and_5')],
                'unique_together': {('message', 'image', 'rating')},
            },
        ),
        migrations.CreateModel(
            name='Bookmark',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookmarks', to=settings.AUTH_USER_MODEL)),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookmarks', to='api.restaurant')),
            ],
            options={
                'unique_together': {('user', 'restaurant')},
            },
        ),
        migrations.CreateModel(
            name='RestaurantCategoryRating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.DecimalField(decimal_places=2, max_digits=3)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.category')),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='restaurant_category_ratings', to='api.restaurant')),
            ],
            options={
                'constraints': [models.CheckConstraint(condition=models.Q(('rating__gte', 0), ('rating__lte', 5)), name='restaurant_rating_between_0_and_5')],
                'unique_together': {('restaurant', 'category')},
            },
        ),
        migrations.CreateModel(
            name='ReviewCategoryRating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.DecimalField(decimal_places=2, max_digits=3)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.category')),
                ('review', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='review_category_ratings', to='api.review')),
            ],
            options={
                'constraints': [models.CheckConstraint(condition=models.Q(('rating__gte', 0), ('rating__lte', 5)), name='rating_between_0_and_5')],
            },
        ),
        migrations.CreateModel(
            name='UserCategoryRating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.DecimalField(decimal_places=2, max_digits=3)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.category')),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.restaurant')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_category_ratings', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'constraints': [models.CheckConstraint(condition=models.Q(('rating__gte', 0), ('rating__lte', 5)), name='user_rating_between_0_and_5')],
                'unique_together': {('user', 'restaurant', 'category')},
            },
        ),
    ]
