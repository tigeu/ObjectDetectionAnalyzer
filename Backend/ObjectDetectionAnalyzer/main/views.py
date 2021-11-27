from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from rest_framework import viewsets, permissions

from ObjectDetectionAnalyzer.main.serializers import UserSerializer, GroupSerializer, HeartbeatSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


def heartbeat(request, count):
    """
    Take incoming number and increment it.
    """
    count += 1
    response_data = {"count": count}
    serializer = HeartbeatSerializer(response_data)
    if request.method == 'GET':
        return JsonResponse(serializer.data, status=201)
