<?php

session_start();
require_once 'config.php';

ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');

if (isset($_POST['register'])) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $ch = curl_init("$SUPABASE_URL/auth/v1/admin/users");
    
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $SUPABASE_SERVICE_ROLE_KEY",
        "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY",
        "Content-Type: application/json"
    ]);
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        "email" => $email,
        "password" => $_POST['password'],
        "email_confirm" => true,
        "user_metadata" => [
            "name" => $name
        ]
    ]));
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);

    header("Location: register.php");
    exit();
}

if (isset($_POST['login'])) {

    $email = $_POST['email'];
    $password = $_POST['password'];

    $ch = curl_init("$SUPABASE_URL/auth/v1/token?grant_type=password");

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $SUPABASE_ANON_KEY",
        "Content-Type: application/json"
    ]);

    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        "email" => $email,
        "password" => $password
    ]));

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

   $authResponse = json_decode(curl_exec($ch), true);

    if (isset($authResponse['access_token'])) {
    
        $_SESSION['sb_access_token'] = $authResponse['access_token'];
        $_SESSION['sb_refresh_token'] = $authResponse['refresh_token'];
    
        $_SESSION['email'] = $email;
        $_SESSION['name'] = $authResponse['user']['user_metadata']['name'] ?? $email;
    
        header("Location: user_page.php");
        exit();
    } else {

        $_SESSION['login_error'] = "Incorrect email or password";
        $_SESSION['active_form'] = "login";

        header("Location: register.php");
        exit();
    }
}
