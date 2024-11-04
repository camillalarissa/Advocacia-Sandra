error_log("Requisição recebida: " . print_r($_POST, true));


<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

session_start();

function generate_csrf_token() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function is_csrf_valid() {
    if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token'])) {
        return true; // Torna opcional para requisições AJAX
    }
    return hash_equals($_SESSION['csrf_token'], $_POST['csrf_token']);
}

function sanitize_input($data) {
    return htmlspecialchars(stripslashes(trim($data)), ENT_QUOTES, 'UTF-8');
}

function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function send_email($to, $subject, $message, $from) {
    $headers = "From: $from\r\n";
    $headers .= "Reply-To: $from\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    return mail($to, $subject, $message, $headers);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!is_csrf_valid()) {
        echo json_encode(['status' => 'error', 'message' => 'Erro de validação CSRF.']);
        exit;
    }

    $nome = sanitize_input($_POST['nome'] ?? '');
    $whatsapp = sanitize_input($_POST['whatsapp'] ?? '');
    $email = sanitize_input($_POST['email'] ?? '');
    $mensagem = sanitize_input($_POST['mensagem'] ?? '');

    if (empty($nome) || empty($whatsapp) || !is_valid_email($email) || empty($mensagem)) {
        echo json_encode(['status' => 'error', 'message' => 'Por favor, preencha todos os campos corretamente.']);
        exit;
    }

    $to = "camilla_larissa7@hotmail.com"; // Substitua pelo seu e-mail
    $subject = "Nova mensagem do formulário de contato";
    $message = "Nome: $nome\n";
    $message .= "WhatsApp: $whatsapp\n";
    $message .= "Email: $email\n\n";
    $message .= "Mensagem:\n$mensagem";

    if (send_email($to, $subject, $message, $email)) {
        echo json_encode(['status' => 'success', 'message' => 'Mensagem enviada com sucesso!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ocorreu um erro ao enviar a mensagem.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido.']);
}
?>