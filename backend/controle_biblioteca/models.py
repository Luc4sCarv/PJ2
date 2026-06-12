# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class TbCategoria(models.Model):
    nome_categoria = models.CharField(max_length=100)

    class Meta:
        managed = True
        db_table = 'tb_categoria'


class TbEmprestimos(models.Model):
    data_emprestimo = models.DateField()
    data_devolucao = models.DateField(blank=True, null=True)
    livro = models.ForeignKey('TbLivros', models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'tb_emprestimos'


class TbLivros(models.Model):
    titulo = models.CharField(max_length=255)
    categoria = models.ForeignKey(TbCategoria, models.DO_NOTHING, blank=True, null=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    autor = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'tb_livros'
