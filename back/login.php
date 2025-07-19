<?php
include 'conexao.php';  

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $senha = $_POST['senha'];

    $sql = "SELECT id_usuario, nome, email, senha FROM usuario WHERE email = ?";
    $stmt = mysqli_prepare($conexao, $sql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        mysqli_stmt_bind_result($stmt, $id_usuario, $nome, $email_db, $senha_hash);
        mysqli_stmt_fetch($stmt);
        if (password_verify($senha, $senha_hash)) {
            // Logado com sucesso
            session_start();
            $_SESSION["usuario"] = [
                "id" => $id_usuario,
                "nome" => $nome,
                "email" => $email_db
            ];
            mysqli_stmt_close($stmt);
            echo "<script>localStorage.setItem('usuario', '" . addslashes(json_encode([ 'id' => $id_usuario, 'nome' => $nome, 'email' => $email_db ])) . "'); window.location.href='../menu-page/menu.html?msg=Login realizado com sucesso!&type=sucesso';</script>";
            exit;
        } else {
            // Senha incorreta
            mysqli_stmt_close($stmt);
            header("Location: ../home-page/login.html?msg=Senha incorreta!&type=erro");
            exit;
        }
    } else {
        // Usuário não encontrado
        mysqli_stmt_close($stmt);
        header("Location: ../home-page/login.html?msg=Usuário não encontrado!&type=erro");
        exit;
    }
}
?>