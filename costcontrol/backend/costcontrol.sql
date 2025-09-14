-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 07-09-2025 a las 13:26:00
-- Versión del servidor: 10.11.10-MariaDB
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u392072837_costcontrol`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `centros_costo`
--

CREATE TABLE `centros_costo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `centros_costo`
--

INSERT INTO `centros_costo` (`id`, `nombre`, `descripcion`, `createdAt`, `updatedAt`) VALUES
(1, 'Rentas de Equipos', 'Alquiler de equipos para instalación y mantenimiento', '2025-07-06 16:49:52.065155', '2025-07-06 16:49:52.065155'),
(3, 'Material de Oficina', 'Suministros y materiales para oficina', '2025-07-06 16:49:52.323752', '2025-07-06 16:49:52.323752'),
(5, 'Vivienda Técnicos', 'Alojamiento para personal técnico en desplazamientos', '2025-07-06 16:49:52.572357', '2025-07-06 16:49:52.572357'),
(7, 'Alquiler de Autos', 'Vehículos para desplazamiento de personal', '2025-07-06 16:49:52.835509', '2025-07-06 16:49:52.835509'),
(9, 'Combustible', 'Combustible para vehículos de la empresa', '2025-07-06 16:49:53.045246', '2025-07-06 16:49:53.045246'),
(11, 'Reparaciones Vehículos', 'Mantenimiento y reparaciones de vehículos propios', '2025-07-06 16:49:53.275549', '2025-07-06 16:49:53.275549'),
(13, 'Maquinaria y Equipos', 'Compra y mantenimiento de maquinaria especializada', '2025-07-06 16:49:53.520189', '2025-07-06 16:49:53.520189'),
(15, 'Servicios Públicos', 'Electricidad, agua, internet, etc.', '2025-07-06 16:49:53.741436', '2025-07-06 16:49:53.741436'),
(17, 'Seguros', 'Pólizas de seguro para equipos y personal', '2025-07-06 16:49:53.986206', '2025-07-06 16:49:53.986206'),
(19, 'Capacitación', 'Formación y actualización del personal', '2025-07-06 16:49:54.288244', '2025-07-06 16:49:54.288244'),
(21, 'Gestoria', 'Solo pagos directos a la gestoria de la empresa.', '2025-07-11 13:15:08.279475', '2025-07-11 13:15:08.279475'),
(22, 'Creditos', 'Creditos de vehiculos', '2025-07-14 11:32:39.776885', '2025-07-14 11:32:39.776885'),
(23, 'Material', 'Material para montajes', '2025-07-14 11:36:54.561246', '2025-07-14 11:36:54.561246'),
(24, 'Pagos Hacienda', 'Iva, Impuestos, etc..', '2025-07-14 11:41:51.183453', '2025-07-14 11:41:51.183453'),
(25, 'Subcontrata', 'Pagos por Subcontratacion de trabajos.', '2025-07-25 09:08:04.712005', '2025-07-25 09:08:04.712005');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL,
  `nombreEmpresa` varchar(255) NOT NULL,
  `moneda` varchar(255) NOT NULL,
  `formatoFecha` varchar(255) NOT NULL,
  `ultimaActualizacion` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `slackBotToken` varchar(255) DEFAULT NULL,
  `slackChannel` varchar(255) DEFAULT NULL,
  `slackEnabled` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (`id`, `nombreEmpresa`, `moneda`, `formatoFecha`, `ultimaActualizacion`, `slackBotToken`, `slackChannel`, `slackEnabled`) VALUES
(1, 'Umtelkomd GMBH', 'EUR', 'DD/MM/YYYY', '2025-07-06 19:00:37.833000', NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuentas_por_pagar`
--

CREATE TABLE `cuentas_por_pagar` (
  `id` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `fechaVencimiento` datetime NOT NULL,
  `proveedor` varchar(255) NOT NULL,
  `concepto` varchar(255) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `centroCostoId` int(11) NOT NULL,
  `estado` varchar(255) NOT NULL,
  `comentarios` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cuentas_por_pagar`
--

INSERT INTO `cuentas_por_pagar` (`id`, `fecha`, `fechaVencimiento`, `proveedor`, `concepto`, `monto`, `centroCostoId`, `estado`, `comentarios`, `createdAt`, `updatedAt`) VALUES
(4, '2025-07-14 00:00:00', '2025-07-14 00:00:00', 'Denis Kocan (Iso)', 'Vivienda', 750.00, 5, 'pagada', 'Se pago es del 28 de junio al 12 de julio.', '2025-07-14 07:24:31.990868', '2025-07-14 07:24:38.000000'),
(6, '2025-06-27 00:00:00', '2025-08-13 10:28:44', 'Frau Dreier', 'FeWo Nieheim Nr.22', 1800.00, 5, 'pagada', 'Diferido: ', '2025-07-14 10:28:44.902228', '2025-08-15 10:50:30.000000'),
(7, '2025-07-04 00:00:00', '2025-08-13 10:29:38', 'Auto-und Reifenservice Müller', 'Revicion Dacia', 966.66, 11, 'pagada', 'Diferido: ', '2025-07-14 10:29:39.091280', '2025-07-18 11:34:39.000000'),
(8, '2025-07-14 00:00:00', '2025-08-13 10:53:38', 'Denis Kocan (Iso)', 'FeWo Meschede', 1350.00, 5, 'pagada', 'Diferido: ', '2025-07-14 10:53:38.957471', '2025-07-18 11:51:20.000000'),
(9, '2025-07-14 00:00:00', '2025-08-13 10:53:46', 'Denis Kocan (Iso)', 'FeWo Meschede', 950.00, 5, 'pagada', 'Diferido: ', '2025-07-14 10:53:46.644007', '2025-07-18 11:51:23.000000'),
(11, '2025-06-30 00:00:00', '2025-07-15 00:00:00', 'DATEV- Rechnung', 'Unternehmen Online', 65.26, 21, 'pagada', 'Es un trimestre de abril a junio.', '2025-07-14 11:19:30.187292', '2025-07-14 11:19:37.000000'),
(12, '2025-07-14 00:00:00', '2025-07-15 00:00:00', 'Rundfunk, ARD, ZDF, DRadio', 'Vehiculos', 18.36, 15, 'pagada', NULL, '2025-07-14 11:26:09.034860', '2025-07-15 07:51:52.000000'),
(13, '2025-07-14 00:00:00', '2025-07-15 00:00:00', 'Bank Deutsches Kraftfahrtzeuggewerbe GmbH', 'Credito Opel', 304.46, 22, 'pagada', NULL, '2025-07-14 11:34:56.669818', '2025-07-15 07:52:04.000000'),
(14, '2025-07-14 00:00:00', '2025-07-15 00:00:00', 'Telefonica O2', 'Seguro Samsumg Galaxy', 13.95, 17, 'pagada', NULL, '2025-07-14 11:38:28.543482', '2025-07-15 07:52:07.000000'),
(15, '2025-07-14 00:00:00', '2025-07-14 00:00:00', 'Finanzamt Stralsund', 'Impuestos nomina', 3865.95, 24, 'pagada', NULL, '2025-07-14 11:43:31.652668', '2025-07-14 11:43:39.000000'),
(16, '2025-06-30 00:00:00', '2025-07-12 00:00:00', 'Tankkarte UTA', 'Cobustible ', 1011.68, 9, 'pagada', 'Combustible quincenal', '2025-07-14 11:48:38.215030', '2025-07-14 11:48:45.000000'),
(17, '2025-07-10 00:00:00', '2025-07-11 00:00:00', 'Amazon', 'Fiber Optic Cleaning Pen', 49.49, 23, 'pagada', NULL, '2025-07-14 11:51:43.942463', '2025-07-14 11:52:14.000000'),
(18, '2025-07-04 00:00:00', '2025-07-04 00:00:00', 'Baumarkt Mesched', 'Material', 11.97, 23, 'pagada', NULL, '2025-07-14 11:54:51.732156', '2025-07-14 11:54:55.000000'),
(19, '2025-07-10 00:00:00', '2025-07-10 00:00:00', 'OBI Baumarkt', 'Material', 7.45, 23, 'pagada', NULL, '2025-07-14 11:55:46.085018', '2025-07-14 11:55:52.000000'),
(20, '2025-07-05 00:00:00', '2025-07-05 00:00:00', 'RCI Banque S.A. NL Deutschland', 'Credito Reanault Trafic', 258.93, 22, 'pagada', NULL, '2025-07-14 11:58:58.778197', '2025-07-14 11:59:06.000000'),
(21, '2025-07-14 00:00:00', '2025-07-20 00:00:00', 'RCI Banque S.A. NL Deutschland', 'Credito Dacia', 273.48, 22, 'pagada', NULL, '2025-07-14 12:05:50.711420', '2025-07-22 09:07:29.000000'),
(22, '2025-07-14 00:00:00', '2025-07-15 00:00:00', 'Finanzamt Stralsund', 'IVA mayo', 4999.23, 24, 'pagada', NULL, '2025-07-14 12:26:31.239561', '2025-07-15 07:52:10.000000'),
(23, '2025-07-15 00:00:00', '2025-07-16 00:00:00', 'Juan Sebastian Lesmes', 'Interces prestamo 17.04.2023', 100.00, 22, 'pagada', NULL, '2025-07-15 11:10:53.316481', '2025-07-15 11:11:01.000000'),
(24, '2025-07-15 00:00:00', '2025-07-29 00:00:00', 'Incerval', 'OTDR cuotas', 515.00, 13, 'pagada', 'Financiacion del 30.04. al 30.11.2025', '2025-07-15 11:57:35.890480', '2025-08-15 10:51:17.000000'),
(31, '2025-07-15 00:00:00', '2025-07-29 00:00:00', 'Incerval', 'Compresor cuotas', 200.00, 13, 'pagada', 'Financiacion 30.05. al 30.12.2025', '2025-07-15 11:59:43.563340', '2025-08-15 10:51:55.000000'),
(32, '2025-07-15 00:00:00', '2025-07-29 00:00:00', 'Incerval', 'Fusionadora FSM-90S cuotas', 466.25, 13, 'pagada', 'Financiacion 30.06.2025 al 30.01.2026', '2025-07-15 12:01:39.551582', '2025-08-22 13:48:59.000000'),
(33, '2025-07-15 00:00:00', '2025-07-29 00:00:00', 'Incerval', 'Sopladora Fibernet Opera cuotas', 940.00, 13, 'pagada', 'Financiacion 30.06.2025 al 30.11.2026', '2025-07-15 12:04:41.699114', '2025-08-15 10:51:12.000000'),
(34, '2025-07-25 00:00:00', '2025-07-28 00:00:00', 'Telefonica O2', 'Telefonos mobiles', 199.56, 23, 'pagada', '8 contratos de telefono.', '2025-07-25 08:56:13.291738', '2025-07-29 11:19:36.000000'),
(35, '2025-07-25 00:00:00', '2025-07-28 00:00:00', 'Tankkarte UTA', 'Cobustible', 978.18, 9, 'pagada', 'Combustible quincenal', '2025-07-25 08:57:27.987232', '2025-07-29 11:19:40.000000'),
(36, '2025-07-23 00:00:00', '2025-07-24 00:00:00', 'Baumarkt Mesched', 'Material', 31.12, 23, 'pagada', NULL, '2025-07-25 08:59:32.181664', '2025-07-25 09:11:30.000000'),
(37, '2025-07-14 00:00:00', '2025-07-23 00:00:00', 'Dennis Jarkow', 'Vivienda', 545.00, 5, 'pagada', 'JARKOWS FeWo, Vivienda Jhon.', '2025-07-25 09:01:36.427137', '2025-07-25 09:11:26.000000'),
(38, '2025-07-23 00:00:00', '2025-07-25 00:00:00', 'Amazon', 'Adaptadores para activacion', 21.62, 13, 'pagada', '2 adactadores par activacion', '2025-07-25 09:04:01.453863', '2025-07-25 09:11:34.000000'),
(39, '2025-07-23 00:00:00', '2025-07-25 00:00:00', 'Amazon', 'Laser', 69.30, 13, 'pagada', '3 Laser', '2025-07-25 09:04:48.786812', '2025-07-25 09:11:38.000000'),
(40, '2025-06-24 00:00:00', '2025-07-25 00:00:00', 'Fractalkom UG', 'Pago parcial Factura RE-2025-004', 3000.00, 25, 'pagada', 'Pago parcial Factura RE-2025-004 \nValor: 7.013,86€', '2025-07-25 09:11:16.540823', '2025-07-25 09:11:45.000000'),
(41, '2025-07-09 00:00:00', '2025-07-29 00:00:00', 'Adolf Würth GmbH', 'Material', 13.19, 23, 'pagada', 'Broca', '2025-07-29 11:22:53.711547', '2025-07-29 11:23:21.000000'),
(42, '2025-07-04 00:00:00', '2025-07-29 00:00:00', 'AOK Rheinland/Hamburg', 'Seguridad Social', 2738.40, 17, 'pagada', 'Seguridad Social Pedro y Simon', '2025-07-29 11:25:22.253681', '2025-07-29 11:27:57.000000'),
(43, '2025-07-04 00:00:00', '2025-07-29 00:00:00', 'AOK Hessen', 'Seguridad Social', 177.11, 17, 'pagada', 'Seguridad Social Manuel Angel de junio', '2025-07-29 11:26:28.467752', '2025-07-29 11:28:00.000000'),
(44, '2025-07-04 00:00:00', '2025-07-29 00:00:00', 'TUI BKK', 'Seguridad Social', 1029.50, 17, 'pagada', 'Seguridad Social Isabelle', '2025-07-29 11:27:42.134606', '2025-07-29 11:28:03.000000'),
(45, '2025-07-29 00:00:00', '2025-07-30 00:00:00', 'MHS-Bender GmbH ', 'equipos', 11.21, 13, 'pagada', 'Llave para sopladora Nanoflow provicional', '2025-08-01 09:26:23.123824', '2025-08-01 09:33:10.000000'),
(46, '2025-07-30 00:00:00', '2025-07-31 00:00:00', 'Baumarkt Meschede', 'Material', 20.74, 23, 'pagada', NULL, '2025-08-01 09:27:43.746114', '2025-08-01 09:33:17.000000'),
(47, '2025-07-30 00:00:00', '2025-07-31 00:00:00', 'Baumart OBI', 'Material Höxter', 18.26, 23, 'pagada', 'Material y SP Höxter', '2025-08-01 09:29:08.378927', '2025-08-01 09:33:19.000000'),
(48, '2025-07-31 00:00:00', '2025-07-31 00:00:00', 'Volksbank eG', 'Iva Poliza ', 75.21, 22, 'pagada', 'Iva banco poliza', '2025-08-01 09:31:14.744133', '2025-08-01 09:33:22.000000'),
(49, '2025-07-31 00:00:00', '2025-07-31 00:00:00', 'Volksbank eG', 'Movimientos y Poliza Banco', 395.82, 22, 'pagada', 'Movimientos y Poliza Banco', '2025-08-01 09:32:56.747445', '2025-08-01 09:33:26.000000'),
(52, '2025-07-15 00:00:00', '2025-07-25 00:00:00', 'Gestoria', 'Nominas etc..', 651.40, 21, 'pagada', NULL, '2025-08-01 14:00:33.903094', '2025-08-15 10:51:38.000000'),
(53, '2025-07-29 00:00:00', '2025-07-30 00:00:00', 'Incerval', 'OTDR', 515.00, 13, 'pagada', 'Financiacion del 30.04. al 30.11.2025', '2025-08-15 10:56:54.115013', '2025-08-22 13:49:07.000000'),
(54, '2025-07-13 00:00:00', '2025-07-15 00:00:00', 'Monteurwohnungen Bräu', 'Vivienda', 1955.00, 5, 'pagada', '5 Personas (15.07.-01.08.2025) FeWo Meschede Bräu', '2025-08-22 13:54:46.408125', '2025-08-22 14:51:14.000000'),
(55, '2025-08-11 00:00:00', '2025-08-11 00:00:00', 'Monteurwohnungen Bräu', 'Vivienda', 1564.00, 5, 'pagada', '5 Pers. á 10 Nächte, 4 Pers. á 4 Nächte\n(01.08.-11.08.2025)+(11.08.-15.08.2025)\n2 Nächte Felipe 06.08-08.08.2025', '2025-08-22 13:57:04.170039', '2025-08-22 14:01:39.000000'),
(56, '2025-08-11 00:00:00', '2025-08-15 00:00:00', 'Monteurwohnungen Bräu	', 'Vivienda', 1564.00, 5, 'pagada', '4 Personen á 17 Nächte\n(15.08.-01.09.2025)', '2025-08-22 13:58:18.340513', '2025-08-22 14:02:04.000000'),
(57, '2025-07-14 00:00:00', '2025-07-14 00:00:00', 'Jeisson Romero', 'Interes', 200.00, 22, 'pagada', 'Interces prestamo 12.11.2024', '2025-08-22 14:49:30.248813', '2025-08-25 13:50:31.000000'),
(58, '2025-07-12 00:00:00', '2025-07-12 00:00:00', 'Jeisson Romero, Isabelle', 'Interes', 182.00, 22, 'pagada', 'Interces prestamo 12.05.2025', '2025-08-22 14:54:02.490766', '2025-08-25 13:50:22.000000'),
(59, '2025-07-12 00:00:00', '2025-07-12 00:00:00', 'Juan y Beatriz', 'Inters', 50.00, 22, 'pagada', 'Intereces prestamo 12.06.2024', '2025-08-22 14:56:00.885666', '2025-08-25 13:50:15.000000'),
(60, '2025-07-27 00:00:00', '2025-07-27 00:00:00', 'Juan y Beatriz', 'Interes', 55.00, 22, 'pagada', 'Intereces prestamo 27.05.2025', '2025-08-22 15:05:22.079447', '2025-08-25 13:51:17.000000'),
(64, '2025-06-24 00:00:00', '2025-08-13 00:00:00', 'Fractalkom UG', 'Pago parcial Factura RE-2025-004', 300.00, 25, 'pagada', 'Pago Factura RE-2025-004 Valor: 6.723,86 €', '2025-08-25 14:02:00.919065', '2025-08-25 14:02:19.000000'),
(65, '2025-06-24 00:00:00', '2025-08-01 00:00:00', 'Factalkom UG', 'Pago parcial Factura RE-2025-004', 3423.86, 25, 'pagada', 'Pago parcial Factura RE-2025-004 Valor: 6.723,86 €', '2025-08-25 14:07:26.130534', '2025-08-25 14:59:53.000000'),
(66, '2025-07-13 00:00:00', '2025-08-01 00:00:00', 'Monteurwohnungen Bräu', 'Vivienda', 1955.00, 5, 'pagada', '5 Personen á 17 Nächte\n(15.07.-01.08.2025)', '2025-08-25 14:09:58.191997', '2025-08-25 14:59:49.000000'),
(67, '2025-08-05 00:00:00', '2025-08-05 00:00:00', 'RCI Banque S.A. NL Deutschland', 'Credito Reanault Trafic', 258.93, 22, 'pagada', NULL, '2025-08-25 14:12:51.664965', '2025-08-25 14:59:48.000000'),
(69, '2025-08-04 00:00:00', '2025-08-05 00:00:00', 'OBI Baumarkt', 'Material', 31.25, 23, 'pagada', NULL, '2025-08-25 14:25:47.408158', '2025-08-25 14:58:55.000000'),
(70, '2025-08-05 00:00:00', '2025-08-06 00:00:00', 'Baumarkt Meschede', 'Material', 58.93, 23, 'pagada', NULL, '2025-08-25 14:27:15.893672', '2025-08-25 14:58:53.000000'),
(71, '2025-07-18 00:00:00', '2025-08-06 00:00:00', 'Adolf Würth GmbH', 'Material', 251.04, 23, 'pagada', 'Brocas', '2025-08-25 14:38:37.988287', '2025-08-25 14:58:50.000000'),
(72, '2025-08-06 00:00:00', '2025-08-07 00:00:00', 'OBI Baumarkt', 'Material', 18.99, 23, 'pagada', NULL, '2025-08-25 14:39:31.459732', '2025-08-25 14:58:48.000000'),
(73, '2025-08-08 00:00:00', '2025-08-08 00:00:00', 'Amazon', 'Equipo de proteccion', 10.99, 13, 'pagada', 'Gafas de proctecion ENE4', '2025-08-25 14:44:18.731788', '2025-08-25 14:58:48.000000'),
(74, '2025-07-31 00:00:00', '2025-08-08 00:00:00', 'Volksbank Vorpommern eG', 'Tarjeta credito', 2118.86, 7, 'pagada', 'Pagos de alquiler de vehiculo, Google.', '2025-08-25 14:46:40.325922', '2025-08-25 14:58:47.000000'),
(75, '2025-07-29 00:00:00', '2025-08-12 00:00:00', 'Tankkarte UTA', 'Cobustible', 861.53, 9, 'pagada', 'Combustible quincenal', '2025-08-25 14:50:07.282447', '2025-08-25 14:58:44.000000'),
(76, '2025-08-11 00:00:00', '2025-08-11 00:00:00', 'Amazon', 'Amazon Prime', 101.15, 3, 'pagada', NULL, '2025-08-25 14:57:02.137781', '2025-08-25 14:58:45.000000'),
(77, '2025-08-11 00:00:00', '2025-08-12 00:00:00', 'OBI Baumarkt', 'Material', 28.46, 23, 'pagada', NULL, '2025-08-25 14:58:08.502660', '2025-08-25 14:58:43.000000'),
(78, '2025-07-31 00:00:00', '2025-08-15 00:00:00', 'Finanzamt Stralsund', 'Impuestos nomina', 3079.54, 24, 'pagada', NULL, '2025-08-25 15:01:58.353402', '2025-08-26 08:41:17.000000'),
(79, '2025-08-10 00:00:00', '2025-08-13 00:00:00', 'Pianas Pension Tiecke', 'Vivienda', 340.00, 5, 'pagada', '11.08. - 15.07.2025', '2025-08-25 15:05:22.046503', '2025-08-26 08:41:22.000000'),
(80, '2025-08-05 00:00:00', '2025-08-22 00:00:00', 'UMTELKOMD ESPANA S.L.', 'Pago parcial Factura INV/2025/00003', 2000.00, 25, 'pagada', 'Factura INV/2025/00003 9.00,00 € mes de julio, estan incluidos los sueldos de Angel, Alexis, Diego, Orlando y Esteban', '2025-08-26 10:57:55.305709', '2025-08-26 11:03:40.000000'),
(81, '2025-08-05 00:00:00', '2025-08-22 00:00:00', 'UMTELKOMD ESPANA S.L.', 'Pago parcial Factura INV/2025/00003', 2264.00, 25, 'pagada', 'Factura INV/2025/00003 9.00,00 € mes de julio, estan incluidos los sueldos de Angel, Alexis, Diego, Orlando y Esteban', '2025-08-26 11:02:13.328607', '2025-08-26 11:03:44.000000'),
(82, '2025-08-05 00:00:00', '2025-08-22 00:00:00', 'UMTELKOMD ESPANA S.L.', 'Pago total Factura INV/2025/00003', 4336.00, 25, 'pagada', 'Factura INV/2025/00003 9.00,00 € mes de julio, estan incluidos los sueldos de Angel, Alexis, Diego, Orlando y Esteban', '2025-08-26 11:03:30.953232', '2025-08-26 11:03:48.000000'),
(83, '2025-08-14 00:00:00', '2025-08-14 00:00:00', 'Finanzamt Stralsund', 'Iva', 11152.47, 24, 'pagada', 'Iva junio', '2025-08-26 11:05:41.958904', '2025-08-28 06:42:37.000000'),
(84, '2025-08-12 00:00:00', '2025-08-14 00:00:00', 'Amazon', 'Material', 37.04, 23, 'pagada', 'Etiquetas Dymo 20 unidades', '2025-08-26 11:07:39.384528', '2025-08-28 06:41:05.000000'),
(85, '2025-08-14 00:00:00', '2025-08-14 00:00:00', 'Telefonica O2', 'Seguro Samsumg Galaxy', 13.95, 17, 'pagada', NULL, '2025-08-26 11:09:25.181127', '2025-08-28 06:41:05.000000'),
(86, '2025-08-15 00:00:00', '2025-08-15 00:00:00', 'Bank Deutsches Kraftfahrtzeuggewerbe GmbH	', 'Credito Opel', 304.46, 22, 'pagada', NULL, '2025-08-26 11:10:41.059310', '2025-08-28 06:41:03.000000'),
(87, '2025-07-26 00:00:00', '2025-08-15 00:00:00', 'Jhon Jairo Rivera Parra', 'Factura # 033', 2175.00, 25, 'pagada', NULL, '2025-08-26 11:15:15.729855', '2025-08-28 06:40:57.000000'),
(88, '2025-08-15 00:00:00', '2025-08-19 00:00:00', 'Amazon', 'Equipo', 23.10, 13, 'pagada', 'Cortadora de fibra', '2025-08-26 11:18:43.233831', '2025-08-28 06:40:49.000000'),
(89, '2025-08-15 00:00:00', '2025-08-20 00:00:00', 'Amazon', 'Equipos', 92.40, 13, 'pagada', '4 cortadoras de fibra', '2025-08-26 11:19:43.439140', '2025-08-28 06:42:35.000000'),
(90, '2025-08-15 00:00:00', '2025-08-19 00:00:00', 'OBI Baumarkt', 'Material', 32.64, 23, 'pagada', 'Meschede', '2025-08-26 11:20:53.391176', '2025-08-28 06:42:36.000000'),
(91, '2025-08-20 00:00:00', '2025-08-20 00:00:00', 'RCI Banque S.A. NL Deutschland	', 'Credito Dacia', 273.48, 22, 'pagada', NULL, '2025-08-26 11:21:51.444640', '2025-08-28 06:40:41.000000'),
(92, '2025-08-19 00:00:00', '2025-08-20 00:00:00', 'OBI Baumarkt', 'Material', 25.23, 23, 'pagada', 'Meschede', '2025-08-26 11:22:54.066613', '2025-08-28 06:44:29.000000'),
(93, '2025-08-20 00:00:00', '2025-08-22 00:00:00', 'Amazon', 'Equipo', 21.02, 13, 'pagada', ' Se piedieron 2 una para Felipe que voto la suya y otra para Pedro. JOKARI®original Universal Entmanteler No.12 zum Abisolieren von Rundkabeln NYM-J 3 x 1,5² bis NYM-J 5 x 2,5², Art.Nr. 30120', '2025-08-26 11:27:55.344867', '2025-08-28 06:44:31.000000'),
(94, '2025-08-06 00:00:00', '2025-08-22 00:00:00', 'Zoll Hauptzollamt Stralsund', 'Barmer Seguridad Social', 8057.28, 15, 'pagada', 'Barmer a fecha del 08.08.2025 se deben 27.138,47 € ', '2025-08-26 11:32:32.304516', '2025-08-28 06:44:35.000000'),
(95, '2025-08-21 00:00:00', '2025-08-22 00:00:00', 'OBI Baumarkt', 'Material', 50.97, 23, 'pagada', 'Meschede', '2025-08-26 11:34:17.946915', '2025-08-28 06:40:32.000000'),
(96, '2025-08-17 00:00:00', '2025-08-17 00:00:00', 'Juan Sebastian Lesmes', 'Interces prestamo 17.04.2023', 100.00, 22, 'pagada', NULL, '2025-08-26 11:35:31.772370', '2025-08-28 06:40:54.000000'),
(97, '2025-08-15 00:00:00', '2025-08-15 00:00:00', 'Juan Sebastian Lesmes	', 'Interces prestamo 15.07.2025', 100.00, 22, 'pagada', NULL, '2025-08-26 11:37:03.307941', '2025-08-28 06:41:02.000000'),
(98, '2025-08-15 00:00:00', '2025-08-22 00:00:00', 'Pianas Pension Tiecke', 'Vivienda Melle', 1860.00, 5, 'pagada', 'Übernachtung im Einzelzimmer 15.08. - 15.09.2025', '2025-08-26 11:40:25.037203', '2025-08-28 06:40:31.000000'),
(99, '2025-07-30 00:00:00', '2025-08-19 00:00:00', 'Adolf Würth GmbH', 'Equipos', 446.89, 13, 'pagada', 'ENE4 Nuevo proyecto.', '2025-08-26 11:45:20.498463', '2025-08-28 06:40:45.000000'),
(100, '2025-08-15 00:00:00', '2025-08-22 00:00:00', 'Kinder und Partner', 'Gestoria', 621.66, 21, 'pagada', 'Nominas, altas bajas, etc.. junio', '2025-08-26 11:48:39.481021', '2025-08-28 06:44:39.000000'),
(102, '2025-08-12 00:00:00', '2025-08-12 00:00:00', 'Jeisson Romero', 'Interes', 200.00, 22, 'pagada', 'Interces prestamo 12.11.2024', '2025-08-26 11:53:07.557817', '2025-08-28 06:44:00.000000'),
(103, '2025-08-12 00:00:00', '2025-08-12 00:00:00', 'Jeisson Romero, Isabelle	', 'Interes', 182.60, 22, 'pagada', 'Interces prestamo 12.05.2025', '2025-08-26 11:56:37.938767', '2025-08-28 06:44:01.000000'),
(104, '2025-08-12 00:00:00', '2025-08-12 00:00:00', 'Juan y Beatriz', 'Interes', 50.00, 22, 'pagada', 'Intereces prestamo 12.06.2024', '2025-08-26 12:09:42.648079', '2025-08-28 06:42:39.000000'),
(105, '2025-08-26 00:00:00', '2025-08-27 00:00:00', 'Juan y Beatriz', 'Interes', 55.00, 22, 'pagada', 'Intereces prestamo 27.05.2025', '2025-08-26 12:10:52.712209', '2025-08-28 06:40:26.000000'),
(106, '2025-08-05 00:00:00', '2025-08-05 00:00:00', 'Beatriz', 'Telefono e Internet', 27.47, 3, 'pagada', NULL, '2025-08-26 12:13:01.531453', '2025-08-28 06:42:43.000000'),
(107, '2025-08-05 00:00:00', '2025-08-05 00:00:00', 'Beatriz', 'Alquiler oficina', 50.00, 3, 'pagada', NULL, '2025-08-26 12:14:41.452494', '2025-08-28 06:43:58.000000'),
(108, '2025-08-08 00:00:00', '2025-08-22 00:00:00', 'Barmer', 'Pago parcial', 9000.00, 15, 'pagada', 'Cuenta pendiente a 08.02.2025 19.081,19 €\nPendiente por pagar 10.081,19 €', '2025-08-26 12:19:43.326308', '2025-08-28 06:44:43.000000'),
(109, '2025-08-21 00:00:00', '2025-08-25 00:00:00', 'Amazon', 'equipos', 50.56, 13, 'pagada', 'Gafas de proteccion', '2025-08-26 12:22:15.072961', '2025-08-28 06:44:48.000000'),
(110, '2025-08-06 00:00:00', '2025-08-26 00:00:00', 'Adolf Würth GmbH', 'equipos', 130.23, 13, 'pagada', 'Brocas', '2025-08-26 12:23:54.289208', '2025-08-28 06:40:29.000000'),
(111, '2025-08-22 00:00:00', '2025-08-26 00:00:00', 'Amazo', 'Equipo mobil', 134.78, 13, 'pagada', 'Mobil para Isabelle', '2025-08-26 12:25:18.189928', '2025-08-28 06:40:28.000000'),
(112, '2025-08-25 00:00:00', '2025-08-26 00:00:00', 'OBI Baumarkt', 'Material', 12.53, 23, 'pagada', 'Meschede', '2025-08-26 12:26:28.615940', '2025-08-28 06:40:27.000000'),
(113, '2025-08-25 00:00:00', '2025-08-26 00:00:00', 'Post AG', 'Pquete', 7.69, 13, 'pagada', 'Envio de cortadora Maquita a Melle proyecto NE4', '2025-08-28 08:25:38.720007', '2025-08-28 08:36:25.000000'),
(114, '2025-08-15 00:00:00', '2025-08-27 00:00:00', 'Tankkarte UTA', 'Combustible', 1310.43, 9, 'pagada', 'Combustible quincenal del 1.08. al 15.08.2025', '2025-08-28 08:27:58.742343', '2025-08-28 08:36:22.000000'),
(115, '2025-08-01 00:00:00', '2025-08-27 00:00:00', 'AOK Rheinland/Hamburg', 'Seguridad Social', 2738.40, 17, 'pagada', 'Seguridad Social Pedro y Simon', '2025-08-28 08:30:42.440618', '2025-08-28 08:36:20.000000'),
(116, '2025-08-01 00:00:00', '2025-08-27 00:00:00', 'TUI BKK', 'Seguridad  Social', 1126.41, 17, 'pagada', 'Seguriadad Social Isabelle', '2025-08-28 08:32:08.466021', '2025-08-28 08:36:19.000000'),
(117, '2025-08-20 00:00:00', '2025-08-28 00:00:00', 'Telefonica O2', 'Telefonos mobiles', 178.56, 23, 'pagada', '8 contratos de telefono.', '2025-08-28 08:35:59.784033', '2025-08-28 08:36:16.000000'),
(118, '2025-08-08 00:00:00', '2025-08-28 00:00:00', 'Adolf Würth GmbH', 'Equipos', 648.07, 13, 'pagada', 'Endoscopio para  NE4', '2025-08-28 08:39:36.099019', '2025-08-29 13:05:11.000000'),
(119, '2025-08-22 00:00:00', '2025-09-11 00:00:00', 'Bagela', 'Equipos', 1904.00, 1, 'pendiente', 'Factura compresor de 2 meses', '2025-08-28 08:42:29.932386', '2025-08-28 08:42:29.932386'),
(120, '2025-08-16 00:00:00', '2025-08-29 00:00:00', 'Jhon Jairo Rivera Parra', 'Factura # 035', 1990.00, 25, 'vencida', NULL, '2025-08-28 08:44:40.551997', '2025-08-29 13:05:01.000000'),
(122, '2025-08-26 00:00:00', '2025-09-09 00:00:00', 'LDL TELEC S.C.P.', 'Factura Nr. 3', 9385.60, 25, 'pendiente', 'Proyecto ROBDORF', '2025-08-28 08:49:08.836107', '2025-08-28 08:49:08.836107'),
(123, '2025-08-27 00:00:00', '2025-09-05 00:00:00', 'Monteurwohnungen Bräu', 'Vivienda', 1587.00, 5, 'vencida', '5 Personen á 15 Nächte (01.09.-15.09.2025) \nFactura real 1.725,00 € Menos 6 noches de Felipe -138= 1.587,00 €', '2025-08-28 08:54:04.644536', '2025-09-05 11:00:41.000000'),
(125, '2025-08-28 00:00:00', '2025-09-26 00:00:00', 'Handelsh.Vorpommern', 'Herramienta', 260.31, 13, 'pendiente', 'Cortadora Maquita para metal, cargador Makita, discos.\nProyecto NE4', '2025-08-28 11:52:49.052114', '2025-08-28 11:52:49.052114'),
(126, '2025-08-23 00:00:00', '2025-09-05 00:00:00', 'Jhon Jairo Rivera Parra	', 'Factura # 036', 2360.00, 25, 'vencida', NULL, '2025-08-29 13:08:10.570636', '2025-09-05 11:00:43.000000'),
(127, '2025-08-28 00:00:00', '2025-08-29 00:00:00', 'Amazon	Fiber Optic Cleaning Pen', 'Equipo y Material ', 105.62, 23, 'pagada', 'Material para Angel, Boligrafo limpiador fibra optica, Velcro, Etiquetiadora Dymo.', '2025-08-29 13:11:54.505124', '2025-08-29 13:12:18.000000'),
(128, '2025-08-02 00:00:00', '2025-08-22 00:00:00', 'Jhon Jairo Rivera Parra	', 'Factura # 034', 1235.00, 25, 'pagada', NULL, '2025-09-03 12:35:09.997821', '2025-09-03 12:35:18.000000'),
(129, '2025-08-29 00:00:00', '2025-08-29 00:00:00', 'Incerval', 'OTDR cuotas', 515.00, 13, 'vencida', 'Financiacion del 30.04. al 30.11.2025', '2025-09-03 12:38:54.093193', '2025-09-03 12:38:54.093193'),
(130, '2025-08-29 00:00:00', '2025-08-29 00:00:00', 'Incerval', 'Compresor cuotas', 200.00, 13, 'vencida', 'Financiacion 30.05. al 30.12.2025', '2025-09-03 12:40:21.534831', '2025-09-03 12:40:21.534831'),
(131, '2025-08-29 00:00:00', '2025-08-29 00:00:00', 'Incerval', 'Fusionadora FSM-90S cuotas', 466.25, 13, 'vencida', 'Financiacion 30.06.2025 al 30.01.2026', '2025-09-03 12:41:41.534674', '2025-09-03 12:41:41.534674'),
(132, '2025-08-29 00:00:00', '2025-08-29 00:00:00', 'ncerval', 'Sopladora Fibernet Opera cuotas', 940.00, 13, 'vencida', 'Financiacion 30.06.2025 al 30.11.2026', '2025-09-03 12:42:46.087537', '2025-09-03 12:42:46.087537');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `proveedor` varchar(255) NOT NULL,
  `concepto` varchar(255) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `centroCostoId` int(11) NOT NULL,
  `metodoPago` varchar(255) NOT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `comentarios` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `createdByUserId` int(11) DEFAULT NULL,
  `reviewedByUserId` int(11) DEFAULT NULL,
  `reviewDate` datetime DEFAULT NULL,
  `reviewComments` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pagos`
--

INSERT INTO `pagos` (`id`, `fecha`, `proveedor`, `concepto`, `monto`, `centroCostoId`, `metodoPago`, `referencia`, `comentarios`, `createdAt`, `updatedAt`, `status`, `createdByUserId`, `reviewedByUserId`, `reviewDate`, `reviewComments`) VALUES
(19, '2025-06-27 00:00:00', 'Frau Dreier', 'FeWo Nieheim Nr.21', 1100.00, 5, 'transferencia', NULL, 'Pago urgente ya que es de mayo', '2025-07-11 12:16:06.712002', '2025-07-14 10:28:40.000000', 'approved', 1, 2, '2025-07-14 10:28:40', NULL),
(20, '2025-06-27 00:00:00', 'Frau Dreier', 'FeWo Nieheim Nr.22', 1800.00, 5, 'transferencia', NULL, 'pago urgente', '2025-07-11 12:17:21.258470', '2025-07-14 10:28:45.000000', 'deferred', 1, 2, '2025-07-14 10:28:45', NULL),
(21, '2025-06-26 00:00:00', 'Adolf Würth GmbH', 'Baumarkt', 125.52, 13, 'transferencia', NULL, 'plazo pago hasta el 16 de julio', '2025-07-11 12:20:09.626434', '2025-07-14 10:27:29.000000', 'approved', 1, 2, '2025-07-14 10:27:28', NULL),
(22, '2025-06-20 00:00:00', 'Bagela', 'Alquiler de compresor M17', 952.00, 13, 'transferencia', NULL, 'Urgente', '2025-07-11 12:22:23.690996', '2025-07-14 10:27:34.000000', 'approved', 1, 2, '2025-07-14 10:27:34', NULL),
(24, '2025-07-08 00:00:00', 'Bagela', 'Alquiler de compresor M17', 412.58, 13, 'transferencia', NULL, NULL, '2025-07-11 12:24:49.831887', '2025-07-14 10:29:44.000000', 'approved', 1, 2, '2025-07-14 10:29:44', NULL),
(25, '2025-06-25 00:00:00', 'Die Arbeitsschutzhelden GmbH', 'Seguro salud y la seguridad', 2068.64, 17, 'transferencia', NULL, 'Urgente daban 14 dias para el pago', '2025-07-11 12:31:03.454770', '2025-07-14 10:28:58.000000', 'approved', 1, 2, '2025-07-14 10:28:57', NULL),
(27, '2025-06-07 00:00:00', 'BARMER', 'Seguro Social', 18014.18, 17, 'transferencia', NULL, 'URGENTE', '2025-07-11 12:35:40.904154', '2025-07-14 10:27:56.000000', 'deferred', 1, 2, '2025-07-14 10:27:56', NULL),
(28, '2025-07-04 00:00:00', 'Auto-und Reifenservice Müller', 'Revicion Dacia', 966.66, 11, 'transferencia', NULL, 'URGENTE', '2025-07-11 12:38:21.915188', '2025-07-14 10:29:39.000000', 'deferred', 1, 2, '2025-07-14 10:29:39', NULL),
(29, '2025-07-07 00:00:00', 'BG ETEM', 'Seguro Mutua', 1632.39, 15, 'transferencia', NULL, 'URGENTE YA QUE ES DEL 2024 CONTRIBUCION', '2025-07-11 12:45:16.188356', '2025-07-14 10:28:12.000000', 'approved', 1, 2, '2025-07-14 10:28:11', NULL),
(30, '2025-06-16 00:00:00', 'Steuerberater Kinder Partner', 'Gestoria', 605.00, 21, 'transferencia', NULL, 'URGENTE', '2025-07-11 13:29:37.070192', '2025-07-14 10:29:31.000000', 'approved', 1, 2, '2025-07-14 10:29:31', NULL),
(31, '2025-07-14 00:00:00', 'Denis Kocan (Iso)', 'FeWo Meschede', 950.00, 5, 'transferencia', NULL, 'Fecha 13.07. al 31.07 2 personal 19 noches.', '2025-07-14 10:33:46.791499', '2025-07-14 10:53:47.000000', 'deferred', 1, 2, '2025-07-14 10:53:47', NULL),
(32, '2025-07-14 00:00:00', 'Denis Kocan (Iso)', 'FeWo Meschede', 1350.00, 5, 'transferencia', NULL, 'Fecha 14.07. al 31.07. 3 personas 18 noches', '2025-07-14 10:35:30.231621', '2025-07-14 10:53:39.000000', 'deferred', 1, 2, '2025-07-14 10:53:39', NULL),
(34, '2025-07-13 00:00:00', 'Monteurwohnungen Bräu', 'FeWo Oberberger Str. 100 59872 Meschede Berge', 1955.00, 5, 'transferencia', NULL, NULL, '2025-07-14 10:40:07.381112', '2025-07-14 10:54:01.000000', 'deferred', 1, 2, '2025-07-14 10:54:01', NULL),
(35, '2025-07-30 00:00:00', 'FeWo Bräu', 'FeWo Meschede', 1656.00, 5, 'transferencia', NULL, 'FeWo de 01.08.-15.08.2025', '2025-08-01 07:38:52.810509', '2025-08-01 13:12:43.000000', 'approved', 1, 2, '2025-08-01 13:12:43', NULL),
(44, '2025-07-30 00:00:00', 'Denis Kocan (Iso)', 'FeWo Meschede', 3875.00, 5, 'transferencia', NULL, 'FeWo 01.08-31.08.2025', '2025-08-01 07:41:56.965514', '2025-08-01 13:12:56.000000', 'deferred', 1, 2, '2025-08-01 13:12:56', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 1,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `active`, `createdAt`, `updatedAt`) VALUES
(1, 'Beatriz Mercedes Sandoval Penaranda', 'bsandoval@umtelkomd.com', 'SSO_USER_obro1svqr8', 'approver', 1, '2025-07-06 17:54:08.775043', '2025-09-05 11:00:43.000000'),
(2, 'Jeisson Andres Romero Lesmes', 'jromero@umtelkomd.com', 'SSO_USER_z5ehgnydqni', 'approver', 1, '2025-07-06 17:54:08.973773', '2025-08-23 19:47:45.000000'),
(3, 'Alejandro Herrera', 'reyalejandroh@gmail.com', 'SSO_USER_lamdpq081h', 'approver', 1, '2025-08-08 06:48:35.536131', '2025-08-10 14:53:15.000000');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `centros_costo`
--
ALTER TABLE `centros_costo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cuentas_por_pagar`
--
ALTER TABLE `cuentas_por_pagar`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `centros_costo`
--
ALTER TABLE `centros_costo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `cuentas_por_pagar`
--
ALTER TABLE `cuentas_por_pagar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=133;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
