# Generated by Django 5.1.6 on 2025-02-16 05:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='restaurant',
            old_name='restaurantName',
            new_name='restaurant_name',
        ),
    ]
