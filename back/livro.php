<?php
include 'conexao.php';
function salvarArquivoLivro($file, $destinoDir, $nomeBase) {
    if ($file && $file['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $nomeArquivo = $nomeBase . '.' . $ext;
        if (!is_dir($destinoDir)) {
            mkdir($destinoDir, 0777, true);
        }
        $destino = $destinoDir . '/' . $nomeArquivo;
        if (move_uploaded_file($file['tmp_name'], $destino)) {
            return $destino;
        }
    }
    return null;
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $sql = "SELECT * FROM livro";
    $result = mysqli_query($conexao, $sql);
    $livros = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $livros[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode($livros);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST) && empty($_FILES) && isset($_SERVER['CONTENT_LENGTH'])) {
        header("Location: ../livro-page/livro.html?msg=O arquivo enviado excede o limite permitido pelo servidor!&type=erro");
        exit;
    }
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $id = isset($_POST['id_livro']) ? $_POST['id_livro'] : null;

    if ($action === 'delete' && $id) {
        $sql = "DELETE FROM livro WHERE id_livro=?";
        $stmt = mysqli_prepare($conexao, $sql);
        mysqli_stmt_bind_param($stmt, "i", $id);
        if (mysqli_stmt_execute($stmt)) {
            mysqli_stmt_close($stmt);
            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
            exit;
        } else {
            mysqli_stmt_close($stmt);
            header("Location: ../livro-page/livro.html?msg=Erro ao excluir livro!&type=erro");
            exit;
        }
    } else {
        $titulo = $_POST['titulo'];
        $descricao = $_POST['descricao'];
        $autor = $_POST['autor'];
        $editora = $_POST['editora'];
        $paginas = $_POST['paginas'];
        $ano = $_POST['ano'];

        if ($action === 'add') {
            if (!isset($_FILES['imagem']) || $_FILES['imagem']['error'] !== UPLOAD_ERR_OK) {
                header("Location: ../livro-page/livro.html?msg=Imagem da capa é obrigatória!&type=erro");
                exit;
            }
            $sql = "INSERT INTO livro (titulo, descricao, autor, editora, paginas, ano) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($conexao, $sql);
            mysqli_stmt_bind_param($stmt, "ssssii", $titulo, $descricao, $autor, $editora, $paginas, $ano);
            if (mysqli_stmt_execute($stmt)) {
                $id_livro = mysqli_insert_id($conexao);
                mysqli_stmt_close($stmt);
                $dirImagem = '../imagens/imagens-menu/livro/' . $id_livro;
                $imagemPath = salvarArquivoLivro($_FILES['imagem'], $dirImagem, 'imagem');
                if (!$imagemPath) {
                    $sqlDel = "DELETE FROM livro WHERE id_livro=?";
                    $stmtDel = mysqli_prepare($conexao, $sqlDel);
                    mysqli_stmt_bind_param($stmtDel, "i", $id_livro);
                    mysqli_stmt_execute($stmtDel);
                    mysqli_stmt_close($stmtDel);
                    header("Location: ../livro-page/livro.html?msg=Falha ao salvar a imagem!&type=erro");
                    exit;
                }
                $imagemRel = str_replace('../', '', $imagemPath);
                $sqlUpdate = "UPDATE livro SET imagem=? WHERE id_livro=?";
                $stmt2 = mysqli_prepare($conexao, $sqlUpdate);
                mysqli_stmt_bind_param($stmt2, "si", $imagemRel, $id_livro);
                mysqli_stmt_execute($stmt2);
                mysqli_stmt_close($stmt2);
                header("Location: ../livro-page/livro.html?msg=Livro cadastrado com sucesso!&type=sucesso");
                exit;
            } else {
                mysqli_stmt_close($stmt);
                header("Location: ../livro-page/livro.html?msg=Erro ao cadastrar livro!&type=erro");
                exit;
            }
        } else if ($action === 'edit' && $id) {
            $sql = "UPDATE livro SET titulo=?, descricao=?, autor=?, editora=?, paginas=?, ano=? WHERE id_livro=?";
            $stmt = mysqli_prepare($conexao, $sql);
            mysqli_stmt_bind_param($stmt, "ssssiii", $titulo, $descricao, $autor, $editora, $paginas, $ano, $id);
            if (mysqli_stmt_execute($stmt)) {
                mysqli_stmt_close($stmt);
                header("Location: ../livro-page/livro.html?msg=Livro editado com sucesso!&type=sucesso");
                exit;
            } else {
                mysqli_stmt_close($stmt);
                header("Location: ../livro-page/livro.html?msg=Erro ao editar livro!&type=erro");
                exit;
            }
        }
    }
}
?>