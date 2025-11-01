-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-10-2025 a las 04:05:38
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `delicias_bakery`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','super_admin') DEFAULT 'admin',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `administradores`
--

INSERT INTO `administradores` (`id`, `nombre`, `email`, `password`, `rol`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@delicias.com', '$2a$10$Rvqxxvu028dfjydvtBOfqusnyuA2tNBfNiZ6kiE7IRkj3qplWMPKO', 'super_admin', 1, '2025-10-11 04:39:16', '2025-10-11 04:39:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `imagen`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Panes', 'Variedad de panes frescos y artesanales', 'categorias/categoria-1760734219985-415066369.png', 1, '2025-10-11 04:39:16', '2025-10-18 01:50:19'),
(2, 'Pasteles', 'Deliciosos pasteles para toda ocasión', 'categorias/categoria-1760734533477-708443366.png', 1, '2025-10-11 04:39:16', '2025-10-18 01:55:33'),
(3, 'Galletas', 'Galletas caseras y tradicionales', 'categorias/categoria-1760734193537-773439572.png', 1, '2025-10-11 04:39:16', '2025-10-18 01:49:53'),
(4, 'Postres', 'Postres especiales y dulces', NULL, 1, '2025-10-11 04:39:16', '2025-10-11 04:39:16'),
(5, 'Tortas', 'Tortas personalizadas para celebraciones', NULL, 1, '2025-10-11 04:39:16', '2025-10-11 04:39:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `tipo_usuario` enum('usuario','admin') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `exitoso` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `login_logs`
--

INSERT INTO `login_logs` (`id`, `usuario_id`, `admin_id`, `tipo_usuario`, `ip_address`, `user_agent`, `exitoso`, `created_at`) VALUES
(1, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-11 19:20:07'),
(2, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', 1, '2025-10-11 19:34:53'),
(3, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-11 20:17:17'),
(4, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', 1, '2025-10-11 20:28:26'),
(5, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-11 20:35:05'),
(6, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-11 20:47:59'),
(7, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-11 21:05:37'),
(8, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', 1, '2025-10-11 21:24:47'),
(9, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-12 01:43:21'),
(10, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', 1, '2025-10-12 02:19:09'),
(11, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', 1, '2025-10-12 02:41:58'),
(12, NULL, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 0, '2025-10-12 04:21:56'),
(13, NULL, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 0, '2025-10-12 04:23:09'),
(14, NULL, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 0, '2025-10-12 04:26:50'),
(15, NULL, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 0, '2025-10-12 04:38:44'),
(16, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-12 04:44:53'),
(17, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-12 15:58:19'),
(18, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-PE) WindowsPowerShell/5.1.26100.6584', 1, '2025-10-12 16:29:02'),
(19, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-13 16:48:19'),
(20, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-13 17:04:48'),
(21, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-13 17:25:18'),
(22, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-PE) WindowsPowerShell/5.1.26100.6584', 1, '2025-10-13 17:41:46'),
(23, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', 1, '2025-10-13 17:43:24'),
(24, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-13 20:16:29'),
(25, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-13 20:16:51'),
(26, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', 1, '2025-10-13 21:13:18'),
(27, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-14 03:27:51'),
(28, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-14 03:51:34'),
(29, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-14 05:25:33'),
(30, 4, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-14 05:34:51'),
(31, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-14 16:19:35'),
(32, NULL, 1, 'admin', '::1', 'curl/8.14.1', 1, '2025-10-15 09:44:02'),
(33, 5, NULL, 'usuario', '::1', 'curl/8.14.1', 1, '2025-10-15 10:01:16'),
(34, NULL, 1, 'admin', '::1', 'curl/8.14.1', 1, '2025-10-15 10:24:00'),
(35, NULL, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 0, '2025-10-15 10:27:22'),
(36, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-15 10:31:52'),
(37, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-15 10:32:02'),
(38, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-15 10:32:19'),
(39, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-15 10:36:16'),
(40, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-15 10:39:09'),
(41, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-PE) WindowsPowerShell/5.1.26100.6584', 1, '2025-10-15 21:09:22'),
(42, 6, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-PE) WindowsPowerShell/5.1.26100.6584', 1, '2025-10-15 21:19:35'),
(43, 6, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-PE) WindowsPowerShell/5.1.26100.6584', 1, '2025-10-15 21:19:52'),
(44, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-15 21:27:25'),
(45, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-15 21:33:31'),
(46, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-15 21:35:50'),
(47, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-15 21:36:02'),
(48, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-15 21:44:16'),
(49, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-15 21:47:56'),
(50, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-15 21:49:35'),
(51, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-15 22:31:26'),
(52, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 0, '2025-10-16 00:31:48'),
(53, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-16 00:32:12'),
(54, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-16 09:12:38'),
(55, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-17 09:29:55'),
(56, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-17 09:32:15'),
(57, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-17 10:02:39'),
(58, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-17 10:02:59'),
(59, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-17 10:04:57'),
(60, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-17 10:23:56'),
(61, NULL, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 0, '2025-10-17 19:54:46'),
(62, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-PE) WindowsPowerShell/5.1.26100.6899', 1, '2025-10-17 19:59:04'),
(63, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-17 20:06:42'),
(64, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-17 20:31:10'),
(65, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-17 22:01:51'),
(66, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-18 01:11:48'),
(67, NULL, NULL, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 0, '2025-10-18 01:13:14'),
(68, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-18 01:13:20'),
(69, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-18 01:32:22'),
(70, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-18 01:37:22'),
(71, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-18 01:53:03'),
(72, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.235 Electron/37.3.1 Safari/537.36', 1, '2025-10-18 10:08:28'),
(73, NULL, 1, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-18 10:08:47'),
(74, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-18 10:11:24'),
(75, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 1, '2025-10-18 10:18:32'),
(76, 2, NULL, 'usuario', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 0, '2025-10-18 21:10:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','confirmado','en_preparacion','listo','entregado','cancelado') DEFAULT 'pendiente',
  `fecha_entrega` date DEFAULT NULL,
  `direccion_entrega` text DEFAULT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuario_id`, `total`, `estado`, `fecha_entrega`, `direccion_entrega`, `telefono_contacto`, `notas`, `created_at`, `updated_at`) VALUES
(1, 2, 492.00, 'pendiente', '2025-10-15', 'sdadsdasdssdasddsa', '931005970', 'sadasdfsfsdfa', '2025-10-14 03:50:53', '2025-10-14 03:50:53'),
(2, 2, 24.00, 'pendiente', '2025-10-15', 'sdadsdasdssdasddsa', '931005970', 'dfsfsdsdf', '2025-10-14 04:10:13', '2025-10-14 04:10:13'),
(3, 2, 246.00, 'listo', '2025-10-24', 'sdadsdasdssdasddsa', '931005970', 'sfasasffsadfasdas', '2025-10-14 04:24:57', '2025-10-14 04:55:17'),
(4, 2, 36.03, 'pendiente', '2025-10-09', 'sdadsdasdssdasddsa', '931005970', 'wqdasddasdas', '2025-10-14 05:30:04', '2025-10-14 05:30:04'),
(5, 4, 1599.00, 'pendiente', '2025-10-16', 'sdadsdasdssdasddsa', '931005970', 'asddasasffsa', '2025-10-14 05:35:56', '2025-10-14 05:35:56'),
(6, 4, 48.04, 'pendiente', '2025-10-15', 'sdadsdasdssdasddsa', '931005970', 'wetshgyfjkghjmi ,ujfyngtbrtyh', '2025-10-14 05:38:01', '2025-10-14 05:38:01'),
(7, 2, 48.00, 'pendiente', '2025-10-18', 'asdassdaasddsa', '931005970', 'asddasdas', '2025-10-17 09:32:43', '2025-10-17 09:32:43'),
(8, 2, 48.00, 'pendiente', '2025-10-17', 'asdsdfasd', '931005970', 'sadfsdfdsafs', '2025-10-17 09:33:29', '2025-10-17 09:33:29'),
(9, 2, 48.00, 'pendiente', '2025-10-18', 'sdafsdfsdfaasdf', '931005970', 'dsdfgsasdwese', '2025-10-17 10:03:48', '2025-10-17 10:03:48'),
(10, 2, 36.00, 'pendiente', '2025-10-18', 'asddasASS', '9310059', 'SAdsadsadSA', '2025-10-17 10:12:24', '2025-10-17 10:12:24'),
(11, 2, 36.00, 'pendiente', '2025-10-22', 'dfassdffsdfas', '931005970', 'sdfdfsfasfsd', '2025-10-17 10:22:47', '2025-10-17 10:22:47'),
(12, 2, 41.00, 'pendiente', '2025-10-18', 'asffasfassfa', '931005970', 'sdadassda', '2025-10-17 11:04:10', '2025-10-17 11:04:10'),
(13, 2, 24.00, 'pendiente', '2025-10-18', 'luiasdadsasd', '931005970', '11243213', '2025-10-17 11:28:54', '2025-10-17 11:28:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_detalles`
--

CREATE TABLE `pedido_detalles` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pedido_detalles`
--

INSERT INTO `pedido_detalles` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 3, 4, 123.00, 492.00),
(2, 2, 2, 1, 12.00, 12.00),
(3, 2, 1, 1, 12.00, 12.00),
(4, 3, 3, 2, 123.00, 246.00),
(5, 4, 4, 3, 12.01, 36.03),
(6, 5, 3, 13, 123.00, 1599.00),
(7, 6, 4, 4, 12.01, 48.04),
(8, 7, 9, 4, 12.00, 48.00),
(9, 8, 9, 4, 12.00, 48.00),
(10, 9, 9, 4, 12.00, 48.00),
(11, 10, 9, 3, 12.00, 36.00),
(12, 11, 9, 3, 12.00, 36.00),
(13, 12, 11, 2, 13.00, 26.00),
(14, 12, 9, 1, 12.00, 12.00),
(15, 12, 10, 1, 3.00, 3.00),
(16, 13, 9, 2, 12.00, 24.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `destacado` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `categoria_id`, `imagen`, `stock`, `destacado`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'luui', 'sdfsd', 12.00, 1, 'productos/producto-1760214539163-22084282.jpg', 0, 0, 0, '2025-10-11 20:28:59', '2025-10-16 09:12:53'),
(2, 'asd', 'asdasd', 12.00, 1, 'productos/producto-1760216883014-167971100.png', 0, 0, 0, '2025-10-11 21:08:03', '2025-10-16 09:12:52'),
(3, 'asdasddsas', 'qweeqwsdasdfgfghtrrt', 123.00, 5, 'productos/producto-1760419987216-266367056.jpeg', 0, 0, 0, '2025-10-12 02:42:25', '2025-10-16 09:12:50'),
(4, 'Inca Kola', 'sdadasdasdasasddasasd', 12.01, 4, 'productos/producto-1760420243740-250749079.png', 42, 0, 0, '2025-10-14 05:29:09', '2025-10-16 09:12:49'),
(5, 'Producto Test Nest', 'Producto de prueba creado desde script', 24.50, 1, 'https://via.placeholder.com/300.png', 5, 1, 0, '2025-10-15 09:45:25', '2025-10-15 09:47:02'),
(6, 'Producto Test Nest', 'Producto de prueba creado desde script', 19.99, 1, 'https://via.placeholder.com/300.png', 5, 0, 0, '2025-10-15 09:51:17', '2025-10-16 09:12:47'),
(7, 'Producto E2E Upload', 'Creado por prueba E2E con imagen', 7.50, 1, 'productos/producto-1760505899804-835132714.jpg', 5, 0, 0, '2025-10-15 10:24:59', '2025-10-16 09:12:46'),
(8, 'Luis Cunyas', 'asddsasdfadsa', 12.00, 1, 'productos/producto-1760546914508-431986972.jpg', 12, 1, 0, '2025-10-15 21:48:34', '2025-10-16 09:12:44'),
(9, 'pan', 'pan caliente', 12.00, 1, 'productos/producto-1760675462270-533732823.jpg', 14, 1, 1, '2025-10-17 09:31:02', '2025-10-17 09:31:02'),
(10, 'queque', 'fsfsasffsfs', 3.00, 2, 'productos/producto-1760680374669-435624514.jpg', 14, 0, 1, '2025-10-17 10:52:54', '2025-10-17 10:52:54'),
(11, 'fsaasd', '213df sfdsdas', 13.00, 3, 'productos/producto-1760680479495-544337280.jpeg', 1322, 0, 1, '2025-10-17 10:54:11', '2025-10-17 10:54:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `telefono`, `direccion`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Maria', 'Garcia', 'prueba+20251013120042@example.com', '$2a$10$HubpkZQdJ471MzRTsH5KxOvrSDnSHCq7hRvP7HJ0wDtmmY88HWUPK', '612345678', 'Calle 123, Ciudad', 1, '2025-10-13 17:00:42', '2025-10-13 17:00:42'),
(2, 'luis', 'cunyas', 'luis@gmail.com', '$2a$10$cyRdakFyeTdD9Np8QkC2T.AB2nX.5pTGvZKXAn9We91qE5RpTzM9a', '931005970', 'uñas palian casa plomo', 1, '2025-10-13 17:24:21', '2025-10-13 17:24:21'),
(3, 'Luis', 'cunyas', 'luis.delicias123@gmail.com', '$2a$10$YQpBz5vRJaLdnNfjJvNI8.pbfHdMo2NLcOIAudBScq790poQfXg12', '931005970', 'unas palian casa plomo', 1, '2025-10-13 17:29:33', '2025-10-13 17:29:33'),
(4, 'rosa', 'melano', 'rosa@gmail.com', '$2a$10$g8kT3VSDrL5Hfbi0uKZAHON/hyj0dP2m9qUaeNv5s9FJ9ACoi7rdW', '931005970', 'uñas palian casa plomo', 1, '2025-10-14 05:34:23', '2025-10-18 10:09:19'),
(5, 'Migra2', 'Test2', 'migracion.test.user1@delicias.com', '$2b$10$k/M7iUEYOYhE1As2uvNcDuNCG41/oy7ZXjrisZIuNbKdOiEPz.RKi', '600123456', 'Av. Migración 456', 1, '2025-10-15 09:57:08', '2025-10-15 10:00:58'),
(6, 'Prueba', 'Usuario', 'test.user1760527153@example.com', '$2b$10$l.I9tY90fIp.InL4EhAvN.rRZqmLthvtnVmX9K/gkI0Afwfp6e/UK', '600123456', 'Calle Falsa 123', 1, '2025-10-15 21:19:12', '2025-10-15 21:19:12');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `login_logs`
--
ALTER TABLE `login_logs`
  ADD CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `login_logs_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `administradores` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  ADD CONSTRAINT `pedido_detalles_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_detalles_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
