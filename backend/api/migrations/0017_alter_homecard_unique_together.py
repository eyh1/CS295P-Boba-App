# Generated by Django 5.1.7 on 2025-05-19 06:56

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_alter_category_category_type_alter_restaurant_image_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='homecard',
            unique_together={('message', 'image', 'rating')},
        ),
    ]
