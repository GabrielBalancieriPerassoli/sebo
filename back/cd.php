<?php
include 'conexao.php';

function salvarArquivo($file, $destinoDir, $nomeBase) {
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
    $sql = "SELECT * FROM cd";

    // Só os últimos 8 CDs são exibidos no menu de catalogo
    if (isset($_GET['ultimos'])) {
        $sql .= " ORDER BY id_cd DESC LIMIT 8";
    }

    $result = mysqli_query($conexao, $sql);
    $cds = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $cds[] = $row;
    }

    header('Content-Type: application/json');
    echo json_encode($cds);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Tratamento para upload excedido
    if (empty($_POST) && empty($_FILES) && isset($_SERVER['CONTENT_LENGTH'])) {
        header("Location: ../cd-page/cd.html?msg=O arquivo enviado excede o limite permitido pelo servidor!&type=erro");
        exit;
    }
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $id = isset($_POST['id_cd']) ? $_POST['id_cd'] : null;
    if ($action === 'delete' && $id) {
        $sql = "DELETE FROM cd WHERE id_cd=?";
        $stmt = mysqli_prepare($conexao, $sql);
        mysqli_stmt_bind_param($stmt, "i", $id);
        if (mysqli_stmt_execute($stmt)) {
            mysqli_stmt_close($stmt);
            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
            exit;
        } else {
            mysqli_stmt_close($stmt);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Erro ao executar exclusão']);
            exit;
        }
    } else {
        $titulo = $_POST['titulo'];
        $artista = $_POST['artista'];
        $faixas = $_POST['faixas'];
        $gravadora = $_POST['gravadora'];
        $ano = $_POST['ano'];
        $trecho_inicio = isset($_POST['trecho_inicio']) ? intval($_POST['trecho_inicio']) : 0;
        $trecho_fim = isset($_POST['trecho_fim']) ? intval($_POST['trecho_fim']) : 0;
        
        if ($action === 'add') {
            $sql = "INSERT INTO cd (titulo, artista, faixas, gravadora, ano, trecho_inicio, trecho_fim) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($conexao, $sql);
            mysqli_stmt_bind_param($stmt, "ssisiii", $titulo, $artista, $faixas, $gravadora, $ano, $trecho_inicio, $trecho_fim);
            if (mysqli_stmt_execute($stmt)) {
                $id_cd = mysqli_insert_id($conexao);
                mysqli_stmt_close($stmt);
                // Salvar arquivos
                $dirAudio = '../imagens/audios-menu/cd/' . $id_cd;
                $dirImagem = '../imagens/imagens-menu/cd/' . $id_cd;
                $musicaPath = null;
                $imagemPath = null;
                if (isset($_FILES['musica']) && $_FILES['musica']['error'] === UPLOAD_ERR_OK) {
                    $musicaPath = salvarArquivo($_FILES['musica'], $dirAudio, 'musica');
                }
                if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
                    $imagemPath = salvarArquivo($_FILES['imagem'], $dirImagem, 'imagem');
                }
                // Salva os caminhos relativos no banco
                $musicaRel = $musicaPath ? str_replace('../', '', $musicaPath) : null;
                $imagemRel = $imagemPath ? str_replace('../', '', $imagemPath) : null;
                $sqlUpdate = "UPDATE cd SET musica=?, imagem=? WHERE id_cd=?";
                $stmt2 = mysqli_prepare($conexao, $sqlUpdate);
                mysqli_stmt_bind_param($stmt2, "ssi", $musicaRel, $imagemRel, $id_cd);
                mysqli_stmt_execute($stmt2);
                mysqli_stmt_close($stmt2);
                header("Location: ../cd-page/cd.html?msg=CD cadastrado com sucesso!&type=sucesso");
                exit;
            } else {
                mysqli_stmt_close($stmt);
                header("Location: ../cd-page/cd.html?msg=Erro ao cadastrar CD!&type=erro");
                exit;
            }
        } else if ($action === 'edit' && $id) {
            $sql = "UPDATE cd SET titulo=?, artista=?, faixas=?, gravadora=?, ano=?, trecho_inicio=?, trecho_fim=? WHERE id_cd=?";
            $stmt = mysqli_prepare($conexao, $sql);
            mysqli_stmt_bind_param($stmt, "ssisiiii", $titulo, $artista, $faixas, $gravadora, $ano, $trecho_inicio, $trecho_fim, $id);
            if (mysqli_stmt_execute($stmt)) {
                mysqli_stmt_close($stmt);
                header("Location: ../cd-page/cd.html?msg=CD editado com sucesso!&type=sucesso");
                exit;
            } else {
                mysqli_stmt_close($stmt);
                header("Location: ../cd-page/cd.html?msg=Erro ao editar CD!&type=erro");
                exit;
            }
        }
    }
}
?>