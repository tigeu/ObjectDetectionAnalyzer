from django.conf.urls import include
from django.urls import path
from rest_framework import routers
from rest_framework_simplejwt import views as jwt_views

from ObjectDetectionAnalyzer.datasetlist.DatasetListView import DatasetListView
from ObjectDetectionAnalyzer.groundtruth.GroundTruthView import GroundTruthView
from ObjectDetectionAnalyzer.image.ImageView import ImageView
from ObjectDetectionAnalyzer.imagefiles.ImageFilesView import ImageFilesView
from ObjectDetectionAnalyzer.metrics.MetricsView import MetricsView
from ObjectDetectionAnalyzer.modellist.ModelListView import ModelListView
from ObjectDetectionAnalyzer.overview.OverviewView import OverviewView
from ObjectDetectionAnalyzer.prediction.PredictionView import PredictionView
from ObjectDetectionAnalyzer.predictionlist.PredictionListView import PredictionListView
from ObjectDetectionAnalyzer.register.RegisterView import RegisterView
from ObjectDetectionAnalyzer.tasks.TasksView import TasksView
from ObjectDetectionAnalyzer.taskslist.TasksListView import TasksListView
from ObjectDetectionAnalyzer.upload.views.UploadDatasetView import UploadDatasetView
from ObjectDetectionAnalyzer.upload.views.UploadGroundTruthView import UploadGroundTruthView
from ObjectDetectionAnalyzer.upload.views.UploadLabelMapView import UploadLabelMapView
from ObjectDetectionAnalyzer.upload.views.UploadPredictionsView import UploadPredictionsView
from ObjectDetectionAnalyzer.upload.views.UploadPyTorchModelView import UploadPyTorchModelView
from ObjectDetectionAnalyzer.upload.views.UploadTensorFlow1ModelView import UploadTensorFlow1ModelView
from ObjectDetectionAnalyzer.upload.views.UploadTensorFlow2ModelView import UploadTensorFlow2ModelView
from ObjectDetectionAnalyzer.upload.views.UploadYolov3ModelView import UploadYolov3ModelView
from ObjectDetectionAnalyzer.upload.views.UploadYolov5ModelView import UploadYolov5ModelView

router = routers.DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    path('image/<str:dataset>/<str:image_name>', ImageView.as_view(), name="image"),
    path('image-files/<str:dataset>', ImageFilesView.as_view(), name="image-files"),

    path('upload/dataset/<str:file_name>', UploadDatasetView.as_view(), name="upload-dataset"),
    path('upload/ground-truth/<str:file_name>', UploadGroundTruthView.as_view(), name="upload"),
    path('upload/label-map/<str:file_name>', UploadLabelMapView.as_view(), name="upload"),
    path('upload/prediction/<str:file_name>', UploadPredictionsView.as_view(), name="upload"),
    path('upload/pytorch/<str:file_name>', UploadPyTorchModelView.as_view(), name="upload"),
    path('upload/tf1/<str:file_name>', UploadTensorFlow1ModelView.as_view(), name="upload"),
    path('upload/tf2/<str:file_name>', UploadTensorFlow2ModelView.as_view(), name="upload"),
    path('upload/yolov3/<str:file_name>', UploadYolov3ModelView.as_view(), name="upload"),
    path('upload/yolov5/<str:file_name>', UploadYolov5ModelView.as_view(), name="upload"),

    path('dataset-list', DatasetListView.as_view(), name="dataset-list"),
    path('dataset-list/<str:dataset>', DatasetListView.as_view(), name="dataset-list"),
    path('prediction-list/<str:dataset>', PredictionListView.as_view(), name="prediction-list"),
    path('model-list', ModelListView.as_view(), name="model-list"),
    path('model-list/<str:model>', ModelListView.as_view(), name="model-list"),
    path('tasks-list', TasksListView.as_view(), name="tasks-list"),
    path('tasks-list/<str:task>', TasksListView.as_view(), name="tasks-list"),

    path('overview', OverviewView.as_view(), name="overview"),

    path('ground-truth/<str:dataset>/<str:image_name>', GroundTruthView.as_view(), name="ground-truth"),
    path('prediction/<str:dataset>/<str:prediction>/<str:image_name>', PredictionView.as_view(), name="prediction"),
    path('metrics/<str:dataset>/<str:prediction>', MetricsView.as_view(), name="metrics"),
    path('tasks/<str:task_name>', TasksView.as_view(), name="tasks"),

    path('register/', RegisterView.as_view(), name="register"),
    path('login/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]
