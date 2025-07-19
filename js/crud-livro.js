let livrosData = [];
// Carregar livros
function carregarLivros(callback) {
    $.get('../back/livro.php', function(data) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = [];
            }
        }
        console.log('Livros recebidos do backend:', data);
        livrosData = Array.isArray(data) ? data : [];
        renderizarLivros(livrosData);
        if (callback) callback();
    });
}

// Renderizar livros na tabela
function renderizarLivros(lista) {
    let tbody = '';
    lista.forEach(livro => {
        tbody += `
            <tr>
                <td>${livro.titulo}</td>
                <td>${livro.autor}</td>
                <td>${livro.paginas}</td>
                <td>${livro.editora}</td>
                <td>${livro.ano}</td>
                <td class="text-center">
                    <button class="btn p-0 border-0 bg-transparent align-middle btn-editar-livro" title="Alterar"
                        data-id="${livro.id_livro}"
                        data-titulo="${livro.titulo}"
                        data-descricao="${livro.descricao || ''}"
                        data-autor="${livro.autor}"
                        data-editora="${livro.editora}"
                        data-paginas="${livro.paginas}"
                        data-ano="${livro.ano}"
                        data-toggle="modal" data-target="#modalEditarLivro">
                        <i class="bi bi-pencil-square" style="color: #274C77; font-size: 1.35em;"></i>
                    </button>
                    <button class="btn p-0 border-0 bg-transparent align-middle ml-2 btn-excluir-livro" title="Excluir" data-id="${livro.id_livro}">
                        <i class="bi bi-trash" style="color: #ff5e7e; font-size: 1.35em;"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    $(".table tbody").html(tbody);
}

// Busca em tempo real
$(document).on('input', '.livro-search-input', function() {
    const termo = $(this).val().toLowerCase();
    const filtrados = livrosData.filter(livro =>
        livro.titulo.toLowerCase().includes(termo) ||
        livro.autor.toLowerCase().includes(termo) ||
        livro.editora.toLowerCase().includes(termo) ||
        String(livro.ano).includes(termo)
    );
    renderizarLivros(filtrados);
});

// Adicionar Livro
$(document).on('submit', '#modalCadastroLivro form', function(e) {
    // Validação simples dos campos obrigatórios
    const titulo = $('#modalTituloLivro').val();
    const descricao = $('#modalDescricaoLivro').val();
    const autor = $('#modalAutorLivro').val();
    const paginas = $('#modalPaginasLivro').val();
    const editora = $('#modalEditoraLivro').val();
    const ano = $('#modalAnoLivro').val();
    const imagem = $('#modalImagemLivro').val();
    if (!titulo || !descricao || !autor || !paginas || !editora || !ano || !imagem) {
        alert('Preencha todos os campos obrigatórios!');
        e.preventDefault();
        return false;
    }
    e.preventDefault();
    var form = this;
    var formData = new FormData(form);
    $.ajax({
        url: '../back/livro.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function(resp) {
            if (resp && resp.success) {
                $('#modalCadastroLivro').modal('hide');
                form.reset();
                carregarLivros();
            } else if (resp && resp.error) {
                alert(resp.error);
            } else {
                // fallback para caso de redirecionamento
                window.location.reload();
            }
        },
        error: function() {
            window.location.reload();
        }
    });
});

// Preencher modal de edição
$(document).on('click', '.btn-editar-livro', function() {
    $('#modalEditarTituloLivro').val($(this).data('titulo'));
    $('#modalEditarAutorLivro').val($(this).data('autor'));
    $('#modalEditarPaginasLivro').val($(this).data('paginas'));
    $('#modalEditarEditoraLivro').val($(this).data('editora'));
    $('#modalEditarAnoLivro').val($(this).data('ano'));
    $('#modalEditarDescricaoLivro').val($(this).data('descricao'));
    $('#modalEditarIdLivro').val($(this).data('id'));
});

// Editar Livro
$('#modalEditarLivro form').submit(function(e) {
    e.preventDefault();
    const form = this;
    const formData = new FormData(form);
    $.ajax({
        url: '../back/livro.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function(resp) {
            if (resp && resp.success) {
                $('#modalEditarLivro').modal('hide');
                form.reset();
                carregarLivros();
            } else if (resp && resp.error) {
                alert(resp.error);
            } else {
                window.location.reload();
            }
        },
        error: function() {
            window.location.reload();
        }
    });
});

// Excluir Livro
let idLivroParaExcluir = null;

$(document).on('click', '.btn-excluir-livro', function() {
    idLivroParaExcluir = $(this).data('id');
    $('#modalConfirmarExclusaoLivro').modal('show');
});

$(document).on('click', '#btnConfirmarExclusaoLivro', function() {
    if (idLivroParaExcluir !== null && idLivroParaExcluir !== undefined) {
        
        $.post('../back/livro.php', {
            action: 'delete',
            id_livro: idLivroParaExcluir
        }, function(resp) {

            if (resp.success) {

                $('#modalConfirmarExclusaoLivro').modal('hide');
                
                setTimeout(() => window.location.reload(), 300);
                
            } else {
                alert('Erro ao excluir livro!');
            }
            idLivroParaExcluir = null;
        }, 'json');
    } else {
        alert('ID inválido para exclusão!');
    }
});

// Carregar livros ao abrir a página
$(document).ready(function() {
    carregarLivros();
});

// Nome do arquivo imagem (cadastro)
$(document).on('change', '#modalImagemLivro', function() {
    $('#nomeImagemLivro').text(this.files[0] ? this.files[0].name : '');
});
