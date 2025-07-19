// Usuário e senha fixos por enquanto até entrar php
let email = "gabriel@gmail.com";
let senha = "123";

(() => {
    iniciaBotoes();
    iniciaValidacoes();
})();

function iniciaBotoes() {
    document.addEventListener("DOMContentLoaded", function () {
        // --- Carousel ---
        const carousel = document.querySelector("#img-carousel");
        if (carousel) {
            const prevButton = document.querySelector(".carousel-control-prev");
            const nextButton = document.querySelector(".carousel-control-next");
            const items = carousel.querySelectorAll(".carousel-item");
            let currentIndex = 0;

            function autoSlide() {
                currentIndex = (currentIndex + 1) % items.length;
                updateCarousel(currentIndex);
            }

            const interval = setInterval(autoSlide, 3000);

            function updateCarousel(index) {
                items.forEach((item, i) => {
                    item.classList.toggle("active", i === index);
                });
            }

            prevButton && prevButton.addEventListener("click", function () {
                clearInterval(interval);
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                updateCarousel(currentIndex);
            });

            nextButton && nextButton.addEventListener("click", function () {
                clearInterval(interval);
                currentIndex = (currentIndex + 1) % items.length;
                updateCarousel(currentIndex);
            });
        }

        // --- Navbar active ---
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach(link => {
            link.addEventListener("click", function () {
                navLinks.forEach(nav => nav.classList.remove("active"));
                this.classList.add("active");
            });
        });

        // --- CDs dinâmicos do menu ---
        fetch('../back/cd.php?ultimos=1')
            .then(response => response.json())
            .then(cds => {
                let html1 = '';
                let html2 = '';

                cds.forEach(function(cd, idx) {
                    const bloco = `
                        <div class="col">
                            <div class="item-box">
                                <img src="../${cd.imagem ? cd.imagem : 'imagens/imagens-menu/disco4.png'}" alt="">
                                <h5 class="item-title">
                                    <button class="btn-play-icon btn-cd-dinamico" 
                                        data-audio="../${cd.musica ? cd.musica : ''}" 
                                        data-inicio="${cd.trecho_inicio}" 
                                        data-fim="${cd.trecho_fim}" 
                                        data-idx="${idx}">
                                        <i class="bi bi-play-fill"></i>
                                        <i class="bi bi-pause-fill" style="display:none"></i>
                                        <span class="spinner-border spinner-border-sm gif-som" style="display:none; margin-left:6px;" role="status" aria-hidden="true"></span>
                                    </button>
                                    <span>${cd.titulo ? cd.titulo : 'CD -'}</span>
                                </h5>
                                <div class="audio-progress-container" id="audio-progress-container-din-${idx}" style="display:none;">
                                    <span id="audio-current-din-${idx}">0:00</span>
                                    <div class="audio-progress-bar-bg">
                                        <div class="audio-progress-bar" id="audio-bar-din-${idx}"></div>
                                    </div>
                                    <span id="audio-duration-din-${idx}">0:00</span>
                                </div>
                            </div>
                        </div>
                    `;
                    if (idx < 4) html1 += bloco;
                    else html2 += bloco;
                });

                document.getElementById('cds-dinamicos-1').innerHTML = html1;
                document.getElementById('cds-dinamicos-2').innerHTML = html2;

                // Controle de áudio único
                let audioAtual = null;
                let progressContainerAtual = null;
                let progressBarAtual = null;
                let currentTimeSpanAtual = null;
                let btnAtual = null;
                let playIconAtual = null;
                let pauseIconAtual = null;
                let gifSomAtual = null;

                document.querySelectorAll('.btn-cd-dinamico').forEach(function(btn) {
                    const audioSrc = btn.getAttribute('data-audio');
                    const inicio = Number(btn.getAttribute('data-inicio'));
                    const fim = Number(btn.getAttribute('data-fim'));
                    const idx = btn.getAttribute('data-idx');

                    const progressContainer = document.getElementById(`audio-progress-container-din-${idx}`);
                    const progressBar = document.getElementById(`audio-bar-din-${idx}`);
                    const currentTimeSpan = document.getElementById(`audio-current-din-${idx}`);
                    const durationSpan = document.getElementById(`audio-duration-din-${idx}`);
                    const playIcon = btn.querySelector("i.bi-play-fill");
                    const pauseIcon = btn.querySelector("i.bi-pause-fill");
                    const gifSom = btn.querySelector(".gif-som");

                    let audio = new Audio(audioSrc);
                    let isPlaying = false;

                    audio.addEventListener("loadedmetadata", () => {
                        durationSpan.textContent = formatTime(fim - inicio);
                    });

                    btn.addEventListener("click", function(e) {
                        e.preventDefault();

                        if (audioAtual && audioAtual !== audio && !audioAtual.paused) {
                            audioAtual.pause();
                            if (progressContainerAtual) progressContainerAtual.style.display = "none";
                            if (progressBarAtual) progressBarAtual.style.width = "0%";
                            if (currentTimeSpanAtual) currentTimeSpanAtual.textContent = "0:00";
                            if (playIconAtual && pauseIconAtual) {
                                playIconAtual.style.display = "";
                                pauseIconAtual.style.display = "none";
                            }
                            if (gifSomAtual) gifSomAtual.style.display = "none";
                            if (btnAtual) btnAtual.classList.remove("playing");
                        }

                        if (!isPlaying) {
                            audio.currentTime = inicio;
                            audio.play();

                            progressContainer.style.display = "flex";
                            playIcon.style.display = "none";
                            pauseIcon.style.display = "";
                            if (gifSom) gifSom.style.display = "";

                            isPlaying = true;
                            audioAtual = audio;
                            progressContainerAtual = progressContainer;
                            progressBarAtual = progressBar;
                            currentTimeSpanAtual = currentTimeSpan;
                            btnAtual = btn;
                            playIconAtual = playIcon;
                            pauseIconAtual = pauseIcon;
                            gifSomAtual = gifSom;
                            btn.classList.add("playing");
                        } else {
                            audio.pause();

                            progressContainer.style.display = "none";
                            progressBar.style.width = "0%";
                            currentTimeSpan.textContent = "0:00";
                            playIcon.style.display = "";
                            pauseIcon.style.display = "none";
                            if (gifSom) gifSom.style.display = "none";
                            isPlaying = false;
                            btn.classList.remove("playing");
                        }
                    });

                    audio.addEventListener("timeupdate", function() {
                        if (audio.currentTime >= fim) {
                            audio.pause();
                            audio.currentTime = inicio;
                            progressBar.style.width = "0%";
                            currentTimeSpan.textContent = "0:00";
                            progressContainer.style.display = "none";
                            playIcon.style.display = "";
                            pauseIcon.style.display = "none";
                            if (gifSom) gifSom.style.display = "none";
                            isPlaying = false;
                            btn.classList.remove("playing");
                            return;
                        }
                        const elapsed = audio.currentTime - inicio;
                        const total = fim - inicio;
                        currentTimeSpan.textContent = formatTime(elapsed);
                        durationSpan.textContent = formatTime(total);
                        const percent = (elapsed / total) * 100;
                        progressBar.style.width = percent + "%";
                    });

                    audio.addEventListener("ended", function () {
                        progressBar.style.width = "0%";
                        currentTimeSpan.textContent = "0:00";
                        progressContainer.style.display = "none";
                        playIcon.style.display = "";
                        pauseIcon.style.display = "none";
                        if (gifSom) gifSom.style.display = "none";
                        isPlaying = false;
                        btn.classList.remove("playing");
                    });

                    function formatTime(sec) {
                        sec = Math.floor(sec);
                        let min = Math.floor(sec / 60);
                        let s = sec % 60;
                        return min + ":" + (s < 10 ? "0" + s : s);
                    }
                });
            });
        // Livros dinâmicos do menu (carrossel)
        fetch('../back/livro.php')
            .then(response => response.json())
            .then(livros => {
                let indicatorsHTML = '';
                let innerHTML = '';

                livros.forEach((livro, idx) => {
                    const ativo = idx === 0 ? 'active' : '';
                    indicatorsHTML += `
                        <li data-target="#img-carousel" data-slide-to="${idx}" class="${ativo}"></li>
                    `;
                    innerHTML += `
                        <div class="carousel-item ${ativo}">
                            <img src="../${livro.imagem ? livro.imagem : 'imagens/imagens-menu/livro/1/imagem.png'}" class="d-block w-100" alt="${livro.titulo}">
                            <div class="carousel-caption">
                                <button class="btn-modal-livro" data-titulo="${livro.titulo}" data-descricao="${livro.descricao}">
                                    <h1 style="margin:0;">${livro.titulo}</h1>
                                </button>
                            </div>
                        </div>
                    `;
                });

                document.querySelector('.carousel-indicators').innerHTML = indicatorsHTML;
                document.querySelector('.carousel-inner').innerHTML = innerHTML;

                // Eventos dos botões do modal
                const botoes = document.querySelectorAll('.btn-modal-livro');
                botoes.forEach(botao => {
                    botao.addEventListener('click', function() {
                        const titulo = botao.getAttribute('data-titulo');
                        const descricao = botao.getAttribute('data-descricao') || "Resumo não disponível.";

                        document.getElementById('modalTitulo').textContent = titulo;
                        document.getElementById('modalResumo').textContent = descricao;

                        const modal = new bootstrap.Modal(document.getElementById('exampleModalLong'));
                        modal.show();
                    });
                });
            });

        // Função para preencher o modal de edição com os dados do CD selecionado
        if (window.jQuery) {
            $(document).on('click', '.btn-editar-cd', function () {
                const titulo = $(this).data('titulo');
                const artista = $(this).data('artista');
                const faixas = $(this).data('faixas');
                const gravadora = $(this).data('gravadora');
                const ano = $(this).data('ano');
                $('#modalEditarTituloCd').val(titulo);
                $('#modalEditarArtistaCd').val(artista);
                $('#modalEditarNumeroFaixasCd').val(faixas);
                $('#modalEditarGravadoraCd').val(gravadora);
                $('#modalEditarAnoCd').val(ano);
            });
        }
    });
}

function iniciaValidacoes() {
    document.addEventListener("DOMContentLoaded", function() {
        let emailInput = document.getElementById("email");
        let senhaInput = document.getElementById("senha");
        const loginButton = document.querySelector(".btn-login");

        if (loginButton) {
            loginButton.addEventListener("click", function(e) {
                e.preventDefault();

                const emailValue = emailInput.value.trim();
                const senhaValue = senhaInput.value;

                // Validação de campos vazios
                if (!emailValue || !senhaValue) {
                    alert("Por favor, preencha todos os campos.");
                    return;
                }

                // Validação de formato de e-mail
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailValue)) {
                    alert("Digite um e-mail válido.");
                    emailInput.focus();
                    return;
                }

                // Validação de senha mínima
                if (senhaValue.length < 3) {
                    alert("A senha deve ter pelo menos 3 caracteres.");
                    senhaInput.focus();
                    return;
                }

                // Validação de usuário e senha corretos
                if (emailValue === email && senhaValue === senha) {
                    alert("Login realizado com sucesso!");
                    window.location.href = "../menu-page/menu.html";
                } else {
                    alert("Email ou senha incorretos. Tente novamente.");
                    emailInput.value = "";
                    senhaInput.value = "";
                    emailInput.focus();
                }
            });
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
        const btnCadastro = document.querySelector('.btn-login');
        if (btnCadastro) {
            btnCadastro.addEventListener('click', function (e) {
                e.preventDefault();

                // Campos
                const nome = document.getElementById('name').value.trim();
                const email = document.getElementById('email').value.trim();
                const cpf = document.getElementById('cpf').value.trim();
                const cidade = document.getElementById('city').value.trim();
                const senha = document.getElementById('password').value;
                const confirmarSenha = document.getElementById('confirm-password').value;

                // Validação de campos vazios
                if (!nome || !email || !cpf || !cidade || !senha || !confirmarSenha) {
                    alert("Por favor, preencha todos os campos.");
                    return;
                }

                // Validação de nome (mínimo 3 letras)
                if (nome.length < 3) {
                    alert("O nome deve ter pelo menos 3 caracteres.");
                    return;
                }

                // Validação de e-mail
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert("Digite um e-mail válido.");
                    return;
                }

                // Validação de CPF (11 dígitos numéricos)
                const cpfRegex = /^\d{11}$/;
                if (!cpfRegex.test(cpf)) {
                    alert("Digite um CPF válido (apenas números, 11 dígitos).");
                    return;
                }

                // Validação de senha uma letra maiuscula, um numero e um caractere especial
                const senhaRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{4,}$/;
                if (!senhaRegex.test(senha)) {
                    alert("A senha deve ter pelo menos 4 caracteres, uma letra maiúscula, um número e um caractere especial.");
                    return;
                }

                // Senha e confirmação iguais
                if (senha !== confirmarSenha) {
                    alert("As senhas não coincidem.");
                    return;
                }

                alert("Cadastro realizado com sucesso!");
            });
        }
    });
}