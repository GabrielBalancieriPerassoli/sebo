let cdsData = [];
// Função para carregar CDs
function carregarCDs(callback) {
    $.get('../back/cd.php', function(data) {
        // Garante que o retorno é um array
        console.log('Dados recebidos:', data);
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = [];
            }
        }
        cdsData = Array.isArray(data) ? data : [];
        renderizarCDs(cdsData);
        if (callback) callback();
    });
}
// Função para renderizar CDs na tabela
function renderizarCDs(lista) {
    let tbody = '';
    lista.forEach(cd => {
        tbody += `
            <tr>
                <td>${cd.titulo}</td>
                <td>${cd.artista}</td>
                <td>${cd.faixas}</td>
                <td>${cd.gravadora}</td>
                <td>${cd.ano}</td>
                <td class="text-center">
                    <button class="btn p-0 border-0 bg-transparent align-middle btn-editar-cd" title="Alterar"
                        data-id="${cd.id_cd}"
                        data-titulo="${cd.titulo}"
                        data-artista="${cd.artista}"
                        data-faixas="${cd.faixas}"
                        data-gravadora="${cd.gravadora}"
                        data-ano="${cd.ano}"
                        data-trecho_inicio="${cd.trecho_inicio}"
                        data-trecho_fim="${cd.trecho_fim}"
                        data-toggle="modal" data-target="#modalEditarCD">
                        <i class="bi bi-pencil-square" style="color: #274C77; font-size: 1.35em;"></i>
                    </button>
                    <button class="btn p-0 border-0 bg-transparent align-middle ml-2 btn-excluir-cd" title="Excluir" data-id="${cd.id_cd}">
                        <i class="bi bi-trash" style="color: #ff5e7e; font-size: 1.35em;"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    $(".table tbody").html(tbody);
}
// Busca em tempo real
$(document).on('input', '.cd-search-input', function() {
    const termo = $(this).val().toLowerCase();
    const filtrados = cdsData.filter(cd =>
        cd.titulo.toLowerCase().includes(termo) ||
        cd.artista.toLowerCase().includes(termo) ||
        cd.gravadora.toLowerCase().includes(termo) ||
        String(cd.ano).includes(termo)
    );
    renderizarCDs(filtrados);
});
// Adicionar CD
$("#modalCadastroCD form").submit(function(e) {
    const inicioStr = $('#modalTrechoInicioCd').val();
    const fimStr = $('#modalTrechoFimCd').val();
    const inicio = Number(inicioStr);
    const fim = Number(fimStr);

    if (
        isNaN(inicio) || isNaN(fim) ||
        inicioStr === "" || fimStr === "" ||
        inicio < 0 || fim < 0 ||
        fim <= inicio
    ) {
        alert('O tempo final deve ser maior que o tempo inicial do trecho e ambos devem ser números válidos e positivos!');
        $('#modalTrechoFimCd').focus();
        e.preventDefault();
        return false;
    }
    e.preventDefault();
    var form = this;
    var formData = new FormData(form);
    $.ajax({
        url: '../back/cd.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function(resp) {
            if (resp && resp.success) {
                $('#modalCadastroCD').modal('hide');
                form.reset();
                carregarCDs();
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
$(document).on('click', '.btn-editar-cd', function() {
    $('#modalEditarTituloCd').val($(this).data('titulo'));
    $('#modalEditarArtistaCd').val($(this).data('artista'));
    $('#modalEditarNumeroFaixasCd').val($(this).data('faixas'));
    $('#modalEditarGravadoraCd').val($(this).data('gravadora'));
    $('#modalEditarAnoCd').val($(this).data('ano'));
    $('#modalEditarIdCd').val($(this).data('id'));
    $('#modalEditarTrechoInicioCd').val($(this).data('trecho_inicio'));
    $('#modalEditarTrechoFimCd').val($(this).data('trecho_fim'));
});
// Editar CD
$('#modalEditarCD form').submit(function(e) {
    const inicioStr = $('#modalEditarTrechoInicioCd').val();
    const fimStr = $('#modalEditarTrechoFimCd').val();
    console.log($('#modalEditarTrechoInicioCd').val($(this).data('trecho_inicio')));
    const inicio = Number(inicioStr);
    const fim = Number(fimStr);

    if (
        isNaN(inicio) || isNaN(fim) ||
        inicioStr === "" || fimStr === "" ||
        inicio < 0 || fim < 0 ||
        fim <= inicio
    ) {
        alert('O tempo final deve ser maior que o tempo inicial do trecho e ambos devem ser números válidos e positivos!');
        $('#modalEditarTrechoFimCd').focus();
        e.preventDefault();
        return;
    }

    e.preventDefault(); 
    const form = this;
    const formData = new FormData(form);

    $.ajax({
        url: '../back/cd.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function(resp) {
            if (resp && resp.success) {
                $('#modalEditarCD').modal('hide');
                form.reset();
                carregarCDs();
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
// Excluir CD
let idParaExcluir = null;

$(document).on('click', '.btn-excluir-cd', function() {
    idParaExcluir = $(this).data('id');
    $('#modalConfirmarExclusao').modal('show');
});

$(document).on('click', '#btnConfirmarExclusao', function() {
    console.log('Botão de confirmação clicado');
    console.log('Valor atual de idParaExcluir:', idParaExcluir);

    if (idParaExcluir !== null && idParaExcluir !== undefined) {

        $.post('../back/cd.php', {
            action: 'delete',
            id_cd: idParaExcluir
        }, function(resp) {

            if (resp.success) {

                $('#modalConfirmarExclusao').modal('hide');

                setTimeout(() => window.location.reload(), 300);
                
            } else {
                alert('Erro ao excluir CD!');
            }

            idParaExcluir = null;
        }, 'json');
    } else {
        alert('ID inválido para exclusão!');
    }
});

// Carregar CDs ao abrir a página
$(document).ready(function() {
    carregarCDs();
});

$(document).on('change', '#modalImagemCd', function() {
    $('#nomeImagemCd').text(this.files[0] ? this.files[0].name : '');
});
$(document).on('change', '#modalMusicaCd', function() {
    $('#nomeMusicaCd').text(this.files[0] ? this.files[0].name : '');
});
