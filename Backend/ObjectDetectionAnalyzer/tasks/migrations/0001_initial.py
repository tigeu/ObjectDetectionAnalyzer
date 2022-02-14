# Generated by Django 3.2.9 on 2022-02-13 07:21

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('upload', '0005_rename_dir_models_label_map_path'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Tasks',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('description', models.CharField(max_length=250)),
                ('file_name', models.CharField(max_length=50)),
                ('progress', models.FloatField(default=0)),
                ('started', models.DateTimeField(default=django.utils.timezone.now)),
                ('finished', models.DateTimeField(null=True)),
                ('datasetId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='upload.dataset')),
                ('modelId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='upload.models')),
                ('userId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('name', 'userId')},
            },
        ),
    ]