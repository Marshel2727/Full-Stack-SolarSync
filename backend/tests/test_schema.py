"""Offline schema checks; no MySQL server or .env is needed."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

from sqlalchemy import CheckConstraint, ForeignKeyConstraint, Index, MetaData, Table, UniqueConstraint
from sqlalchemy.dialects import mysql
from sqlalchemy.schema import AddConstraint, CreateTable

from app.model import Base  # registers all feature models on the shared metadata


class MigrationCapture:
    def __init__(self):
        self.metadata = MetaData()

    def create_table(self, name, *items, **options):
        return Table(name, self.metadata, *items, **options)

    def create_index(self, name, table, columns):
        target = self.metadata.tables[table]
        Index(name, *(target.c[column] for column in columns))

    def add_column(self, table, column):
        self.metadata.tables[table].append_column(column)

    def create_unique_constraint(self, name, table, columns):
        self.metadata.tables[table].append_constraint(UniqueConstraint(*columns, name=name))

    def create_foreign_key(self, name, source, target, local, remote, **options):
        self.metadata.tables[source].append_constraint(ForeignKeyConstraint(
            local, [f"{target}.{column}" for column in remote],
            name=name, **options,
        ))


def table_signature(table):
    dialect = mysql.dialect()
    return {
        "columns": [
            (
                column.name, column.type.compile(dialect=dialect),
                column.nullable, column.primary_key,
                str(column.server_default.arg)
                if column.server_default is not None and column.computed is None else None,
                str(column.computed.sqltext) if column.computed is not None else None,
            )
            for column in table.columns
        ],
        "unique": sorted(
            tuple(c.name for c in constraint.columns)
            for constraint in table.constraints if isinstance(constraint, UniqueConstraint)
        ),
        "checks": sorted(
            str(constraint.sqltext)
            for constraint in table.constraints if isinstance(constraint, CheckConstraint)
        ),
        "indexes": sorted(
            (index.name, tuple(c.name for c in index.columns), index.unique)
            for index in table.indexes
        ),
        "foreign_keys": sorted(
            (fk.parent.name, fk.target_fullname, fk.ondelete)
            for fk in table.foreign_keys
        ),
    }


class SchemaTests(unittest.TestCase):
    def test_optional_text_column_types(self):
        for table_name, column_name in [
            ("request_documents", "document_number"),
            ("devices", "firmware_version"),
        ]:
            with self.subTest(table=table_name, column=column_name):
                column = Base.metadata.tables[table_name].c[column_name]
                self.assertEqual(column.type.compile(dialect=mysql.dialect()), "VARCHAR(100)")
                self.assertTrue(column.nullable)

    def test_mysql_ddl_compiles(self):
        self.assertEqual(len(Base.metadata.tables), 34)
        for table in Base.metadata.tables.values():
            with self.subTest(table=table.name):
                ddl = str(CreateTable(table).compile(dialect=mysql.dialect()))
                self.assertIn("ENGINE=InnoDB", ddl)
                for constraint in table.foreign_key_constraints:
                    str(AddConstraint(constraint).compile(dialect=mysql.dialect()))
                    self.assertLessEqual(len(constraint.name), 64)

    def test_migrations_match_models(self):
        path = Path(__file__).resolve().parents[1] / "alembic/versions/0001_initial_schema.py"
        spec = importlib.util.spec_from_file_location("initial_revision", path)
        migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration)
        capture = MigrationCapture()
        with patch.object(migration, "op", capture):
            migration.upgrade()
        path = path.with_name("0002_cache_epochs.py")
        spec = importlib.util.spec_from_file_location("cache_revision", path)
        cache_migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cache_migration)
        with patch.object(cache_migration, "op", capture):
            cache_migration.upgrade()
        path = path.with_name("0003_google_identity.py")
        spec = importlib.util.spec_from_file_location("google_revision", path)
        google_migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(google_migration)
        with patch.object(google_migration, "op", capture):
            google_migration.upgrade()
        self.assertEqual(set(capture.metadata.tables), set(Base.metadata.tables))
        for name, table in Base.metadata.tables.items():
            with self.subTest(table=name):
                self.assertEqual(table_signature(table), table_signature(capture.metadata.tables[name]))

    def test_telemetry_idempotency_and_single_accepted_quotation(self):
        for name, columns in [
            ("device_telemetry", ("device_id", "recorded_at")),
            ("system_energy_intervals", ("system_id", "interval_start_at")),
            ("energy_daily_summaries", ("system_id", "local_date")),
            ("quotations", ("accepted_request_id",)),
        ]:
            self.assertIn(columns, table_signature(Base.metadata.tables[name])["unique"])
        self.assertIsNotNone(Base.metadata.tables["quotations"].c.accepted_request_id.computed)


if __name__ == "__main__":
    unittest.main()
