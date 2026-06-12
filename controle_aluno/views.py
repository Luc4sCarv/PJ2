from django.shortcuts import get_object_or_404
from typing import List
from django.shortcuts import render
from ninja_extra import route, api_controller
from controle_aluno.models import Aluno
from controle_aluno.models import Endereco
from controle_aluno.schemas import AlunoIn, AlunoOut, AlunoExcluido

# Create your views here.

@api_controller("/controle_aluno",)
class ControleAlunosView:
    @route.get("/consultar-alunos", response=List[AlunoOut])
    def consultar_alunos(self):
        return Aluno.objects.all().values()
    
    @route.get("/consultar-alunos/{id}", response=List[AlunoOut])
    def consultar_alunos(self, id:int):
        return Aluno.objects.filter(id=id)


    @route.post("/criar-aluno", response=AlunoOut)
    def criar_aluno(self, data: AlunoIn): 
        aluno = Aluno.objects.create(**data.dict())
        return aluno
    
    @route.delete("/deletar-aluno/{id}", response=AlunoExcluido)
    def deletar_aluno(self, id: int):
        aluno = Aluno.objects.get(id=id)
        aluno.delete()
        return {"mensagem": "aluno deletado com sucesso ", "id": id}

    @route.put("/alunos/{aluno_id}", response=AlunoOut)
    def update_aluno(request, aluno_id: int, payload: AlunoIn):
        # Busca o aluno ou retorna erro 404
        aluno = get_object_or_404(Aluno, id=aluno_id)
        
        # Atualiza os atributos do aluno com os dados do payload
        for attr, value in payload.dict().items():
            setattr(aluno, attr, value)
            
        aluno.save()
        return aluno

    # Rota de Update para Endereço
    @route.put("/enderecos/{endereco_id}", response=EnderecoOut)
    def update_endereco(request, endereco_id: int, payload: EnderecoIn):
        # Busca o endereço ou retorna erro 404
        endereco = get_object_or_404(Endereco, id=endereco_id)
        
        # Atualiza os atributos do endereço
        for attr, value in payload.dict().items():
            setattr(endereco, attr, value)
            
        endereco.save()
        return endereco
