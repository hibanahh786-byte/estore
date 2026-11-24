from django.urls import path
from .views import (
    OrderRootView,
    MyOrdersListView,
    OrderDetailView,
    AdminOrderStatusUpdateView
)

urlpatterns = [
    path('', OrderRootView.as_view(), name='orders-root'),
    path('my-orders/', MyOrdersListView.as_view(), name='orders-my-orders'),
    path('<int:id>/', OrderDetailView.as_view(), name='orders-detail'),
    path('<int:id>/status/', AdminOrderStatusUpdateView.as_view(), name='orders-status-update'),
]
