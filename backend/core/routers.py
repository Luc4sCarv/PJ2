
class BancoDadosRouter:
    """
    Router simples para separar apps por banco de dados.
    app 'default' -> MySQL
    app 'biblioteca' -> PostgreSQL
    """
    APP_DB_MAP = {
        "controle_aluno": "default",
        "controle_biblioteca": "biblioteca",
    }
    ALLOWED_DATABASES = {"default", "biblioteca"}

    def _get_db_for_model(self, model):
        return self.APP_DB_MAP.get(model._meta.app_label, "default")

    def db_for_read(self, model, **hints):
        return self._get_db_for_model(model)

    def db_for_write(self, model, **hints):
        return self._get_db_for_model(model)

    def _get_instance_db(self, obj):
        if obj._state.db:
            return obj._state.db
        return self._get_db_for_model(obj.__class__)

    def allow_relation(self, obj1, obj2, **hints):
        db1 = self._get_instance_db(obj1)
        db2 = self._get_instance_db(obj2)
        if db1 == db2 and db1 in self.ALLOWED_DATABASES:
            return True
        return False

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        target_db = self.APP_DB_MAP.get(app_label, "default")
        return db == target_db