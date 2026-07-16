<?php

require_once __DIR__ . '/env.php';

// Load .env if it exists (local dev). In production, your host sets
// these as real environment variables instead, and this becomes a no-op.
loadEnv(__DIR__ . '/.env');

$host     = getenv('DB_HOST') ?: 'localhost';
$user     = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';
$database = getenv('DB_DATABASE') ?: 'users_db';

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$SUPABASE_URL              = getenv('SUPABASE_URL');
$SUPABASE_ANON_KEY         = getenv('SUPABASE_ANON_KEY');
$SUPABASE_SERVICE_ROLE_KEY = getenv('SUPABASE_SERVICE_ROLE_KEY');

if (!$SUPABASE_URL || !$SUPABASE_ANON_KEY || !$SUPABASE_SERVICE_ROLE_KEY) {
    die('Missing required Supabase environment variables. Check your .env file (local) or host env settings (production).');
}
