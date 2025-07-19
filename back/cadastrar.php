<?php
include 'conexao.php';  

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = $_POST['name'];
    $email = $_POST['email'];
    $cpf = $_POST['cpf'];
    $cidade = $_POST['city'];
    $senha = $_POST['password'];
    $confirmar = $_POST['confirm-password'];

    // Verifica se já existe email ou cpf cadastrado
    $sql_check = "SELECT COUNT(*) FROM usuario WHERE email = ? OR cpf = ?";
    $stmt_check = mysqli_prepare($conexao, $sql_check);
    mysqli_stmt_bind_param($stmt_check, "ss", $email, $cpf);
    mysqli_stmt_execute($stmt_check);
    mysqli_stmt_bind_result($stmt_check, $existe);
    mysqli_stmt_fetch($stmt_check);
    mysqli_stmt_close($stmt_check);

    if ($existe > 0) {
        header("Location: ../home-page/cadastro.html?msg=Já existe um usuário cadastrado com este e-mail ou CPF!&type=erro");
        exit;
    } else if ($senha !== $confirmar) {
        header("Location: ../home-page/cadastro.html?msg=As senhas não coincidem!&type=erro");
        exit;
    } else {
        // Criptografa a senha antes de salvar
        $senha_hash = password_hash($senha, PASSWORD_DEFAULT);

        $sql = "INSERT INTO usuario (nome, email, cpf, cidade, senha) VALUES (?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conexao, $sql);
        mysqli_stmt_bind_param($stmt, "sssss", $nome, $email, $cpf, $cidade, $senha_hash);

        if (mysqli_stmt_execute($stmt)) {
            mysqli_stmt_close($stmt);
            header("Location: ../menu-page/menu.html?msg=Cadastro realizado com sucesso!&type=sucesso");
            exit;
        } else {
            mysqli_stmt_close($stmt);
            header("Location: ../home-page/cadastro.html?msg=Erro ao cadastrar!&type=erro");
            exit;
        }
    }
}
?>