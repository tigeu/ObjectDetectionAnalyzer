from pathlib import Path
from unittest.mock import patch

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from ObjectDetectionAnalyzer.settings import IMAGE_ENDINGS
from ObjectDetectionAnalyzer.upload.UploadModels import Dataset
from ObjectDetectionAnalyzer.upload.views.UploadDatasetView import UploadDatasetView


class TestUploadDatasetView(APITestCase):
    """
    Test UploadDatasetView
    """

    def setUp(self):
        self.view = UploadDatasetView()
        self.user_dir = Path("dir/test")

    def test_requires_dataset(self):
        result = self.view.requires_dataset()
        self.assertEqual(result, False)

    @patch('ObjectDetectionAnalyzer.upload.UploadService.UploadService.is_zip_valid')
    def test_is_file_valid(self, is_zip_valid):
        is_zip_valid.return_value = True
        result = self.view.is_file_valid(Path("tmp_file_path"))
        self.assertEqual(result, True)

    @patch('ObjectDetectionAnalyzer.services.PathService.PathService.get_dataset_dir')
    @patch('ObjectDetectionAnalyzer.services.PathService.PathService.get_combined_dir')
    def test_get_target_dir(self, get_combined_dir, get_dataset_dir):
        get_combined_dir.return_value = Path("data/test")
        get_dataset_dir.return_value = Path("data/test/datasets/test_dataset")

        result = self.view.get_target_dir("test", "test_dataset", "")

        self.assertEqual(result, Path("data/test/datasets/test_dataset"))

    @patch('ObjectDetectionAnalyzer.services.PathService.PathService.create_dir')
    def test_create_dir(self, create_dir):
        create_dir.return_value = True
        result = self.view.create_dir(Path("test_directory"))

        self.assertEqual(result, True)
        create_dir.assert_called_with(Path("test_directory"), True)

    @patch('django.db.models.query.QuerySet.update')
    @patch('ObjectDetectionAnalyzer.upload.UploadService.UploadService.save_compressed_data')
    def test_save_data_with_dataset(self, save_compressed_data, update):
        user = User.objects.create_user("test", "test@test.test", "test")
        Dataset.objects.create(name="test_dataset", path=Path("target"), userId=user)

        self.view.save_data(Path("tmp"), Path("target"), "test_dataset", None, None, None, user, "file")

        save_compressed_data.assert_called_with(Path("tmp"), Path("target"), IMAGE_ENDINGS)
        update.assert_called()

    @patch('django.db.models.query.QuerySet.create')
    @patch('ObjectDetectionAnalyzer.upload.UploadService.UploadService.save_compressed_data')
    def test_save_data_without_dataset(self, save_compressed_data, create):
        user = User.objects.create_user("test", "test@test.test", "test")

        self.view.save_data(Path("tmp"), Path("target"), "test_dataset", None, None, None, user, "file")

        save_compressed_data.assert_called_with(Path("tmp"), Path("target"), IMAGE_ENDINGS)
        create.assert_called_with(name="test_dataset", path=Path("target"), userId=user)
