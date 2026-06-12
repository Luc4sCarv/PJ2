
from django.contrib import admin
from django.urls import path
from django.views.generic import RedirectView
from ninja_extra import NinjaExtraAPI
from controle_aluno.views import ControleAlunosView
from controle_biblioteca.views import ControleBibliotecaView

api = NinjaExtraAPI()
api.register_controllers(ControleAlunosView, ControleBibliotecaView)


urlpatterns = [
    path('', RedirectView.as_view(url='/api/v1/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/v1/', api.urls),
]
