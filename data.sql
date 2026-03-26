-- =========================================================
-- Script: Sistema de Nómina
-- Motor objetivo: SQL Server 2019+
-- =========================================================

IF DB_ID('nomina_db') IS NULL
BEGIN
        CREATE DATABASE nomina_db;
END;

USE nomina_db;
GO

-- =========================
-- Reinicio de esquema (opcional, desde cero)
-- =========================
DROP TABLE IF EXISTS dbo.asiento_contable;
DROP TABLE IF EXISTS dbo.registro_transaccion;
DROP TABLE IF EXISTS dbo.tipo_de_deducciones;
DROP TABLE IF EXISTS dbo.tipo_de_ingresos;
DROP TABLE IF EXISTS dbo.empleado;
GO

-- =========================
-- Tabla: empleado
-- =========================
IF OBJECT_ID('dbo.empleado', 'U') IS NULL
BEGIN
CREATE TABLE dbo.empleado (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    departamento VARCHAR(100) NULL,
    puesto VARCHAR(100) NULL,
    salario_mensual DECIMAL(12,2) NOT NULL,
    id_nomina BIGINT NULL,
    estado BIT NOT NULL CONSTRAINT df_empleado_estado DEFAULT 1,
    fecha_creacion DATETIME2(0) NOT NULL CONSTRAINT df_empleado_fecha_creacion DEFAULT SYSDATETIME(),

    CONSTRAINT uq_empleado_cedula UNIQUE (cedula),
    CONSTRAINT ck_empleado_salario_mensual CHECK (salario_mensual >= 0)
);
END;
GO

-- =========================
-- Tabla: tipo_de_ingresos
-- =========================
IF OBJECT_ID('dbo.tipo_de_ingresos', 'U') IS NULL
BEGIN
CREATE TABLE dbo.tipo_de_ingresos (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    depende_de_salario BIT NOT NULL CONSTRAINT df_tipo_ingreso_depende_salario DEFAULT 0,
    porcentaje DECIMAL(5,2) NULL,
    estado BIT NOT NULL CONSTRAINT df_tipo_ingreso_estado DEFAULT 1,
    fecha_creacion DATETIME2(0) NOT NULL CONSTRAINT df_tipo_ingreso_fecha_creacion DEFAULT SYSDATETIME(),

    CONSTRAINT uq_tipo_ingreso_nombre UNIQUE (nombre),
    CONSTRAINT ck_tipo_ingreso_porcentaje CHECK (porcentaje IS NULL OR (porcentaje >= 0 AND porcentaje <= 100))
);
END;
GO

-- =========================
-- Tabla: tipo_de_deducciones
-- =========================
IF OBJECT_ID('dbo.tipo_de_deducciones', 'U') IS NULL
BEGIN
CREATE TABLE dbo.tipo_de_deducciones (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    depende_de_salario BIT NOT NULL CONSTRAINT df_tipo_deduccion_depende_salario DEFAULT 0,
    porcentaje DECIMAL(5,2) NULL,
    estado BIT NOT NULL CONSTRAINT df_tipo_deduccion_estado DEFAULT 1,
    fecha_creacion DATETIME2(0) NOT NULL CONSTRAINT df_tipo_deduccion_fecha_creacion DEFAULT SYSDATETIME(),

    CONSTRAINT uq_tipo_deduccion_nombre UNIQUE (nombre),
    CONSTRAINT ck_tipo_deduccion_porcentaje CHECK (porcentaje IS NULL OR (porcentaje >= 0 AND porcentaje <= 100))
);
END;
GO

-- =========================
-- Tabla: registro_transaccion
-- =========================
IF OBJECT_ID('dbo.registro_transaccion', 'U') IS NULL
BEGIN
CREATE TABLE dbo.registro_transaccion (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    empleado_id BIGINT NOT NULL,
    tipo_de_deduccion_id BIGINT NOT NULL,
    tipo_transaccion VARCHAR(60) NULL,
    fecha DATE NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    estado BIT NOT NULL CONSTRAINT df_registro_estado DEFAULT 1,
    fecha_creacion DATETIME2(0) NOT NULL CONSTRAINT df_registro_fecha_creacion DEFAULT SYSDATETIME(),

    CONSTRAINT fk_registro_empleado
        FOREIGN KEY (empleado_id)
        REFERENCES dbo.empleado (id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,

    CONSTRAINT fk_registro_tipo_deduccion
        FOREIGN KEY (tipo_de_deduccion_id)
        REFERENCES dbo.tipo_de_deducciones (id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,

    CONSTRAINT ck_registro_monto CHECK (monto >= 0)
);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_registro_transaccion_empleado' AND object_id = OBJECT_ID('dbo.registro_transaccion'))
    CREATE INDEX idx_registro_transaccion_empleado ON dbo.registro_transaccion (empleado_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_registro_transaccion_fecha' AND object_id = OBJECT_ID('dbo.registro_transaccion'))
    CREATE INDEX idx_registro_transaccion_fecha ON dbo.registro_transaccion (fecha);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_registro_transaccion_tipo_deduccion' AND object_id = OBJECT_ID('dbo.registro_transaccion'))
    CREATE INDEX idx_registro_transaccion_tipo_deduccion ON dbo.registro_transaccion (tipo_de_deduccion_id);
GO

-- =========================
-- Tabla: asiento_contable
-- =========================
IF OBJECT_ID('dbo.asiento_contable', 'U') IS NULL
BEGIN
CREATE TABLE dbo.asiento_contable (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    transaccion_id BIGINT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    cuenta VARCHAR(30) NOT NULL,
    tipo_movimiento VARCHAR(10) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    fecha DATE NOT NULL,
    estado BIT NOT NULL CONSTRAINT df_asiento_estado DEFAULT 1,
    fecha_creacion DATETIME2(0) NOT NULL CONSTRAINT df_asiento_fecha_creacion DEFAULT SYSDATETIME(),

    CONSTRAINT fk_asiento_transaccion
        FOREIGN KEY (transaccion_id)
        REFERENCES dbo.registro_transaccion (id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,

    CONSTRAINT ck_asiento_monto CHECK (monto >= 0),
    CONSTRAINT ck_asiento_tipo_movimiento CHECK (tipo_movimiento IN ('DEBITO', 'CREDITO'))
);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_asiento_transaccion' AND object_id = OBJECT_ID('dbo.asiento_contable'))
    CREATE INDEX idx_asiento_transaccion ON dbo.asiento_contable (transaccion_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_asiento_fecha' AND object_id = OBJECT_ID('dbo.asiento_contable'))
    CREATE INDEX idx_asiento_fecha ON dbo.asiento_contable (fecha);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_asiento_cuenta' AND object_id = OBJECT_ID('dbo.asiento_contable'))
    CREATE INDEX idx_asiento_cuenta ON dbo.asiento_contable (cuenta);
GO
