// Aguarda o DOM ser completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona o elemento da navbar e inicializa a variável para controle de rolagem
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    // Adiciona um evento de rolagem para ajustar a aparência da navbar
    window.addEventListener('scroll', function() {
        let st = window.pageYOffset || document.documentElement.scrollTop; // Captura a posição de rolagem
        
        // Adiciona ou remove a classe 'navbar-scrolled' para modificar o estilo da navbar quando a página é rolada
        if (st > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        // Esconde ou mostra a navbar com base na direção da rolagem, apenas em dispositivos móveis
        if (window.innerWidth <= 991) {
            if (st > lastScrollTop) {
                navbar.style.top = '-80px'; // Esconde a navbar rolando para cima
            } else {
                navbar.style.top = '0'; // Mostra a navbar rolando para baixo
            }
        } else {
            navbar.style.top = '0'; // Em telas maiores, a navbar fica sempre visível
        }
        lastScrollTop = st; // Atualiza a última posição de rolagem
    });

    // Adiciona suavidade na rolagem ao clicar em links internos (âncoras)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Previne o comportamento padrão
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth' // Rola suavemente até o elemento alvo
            });
        });
    });

    // Validação do formulário de contato e envio via AJAX
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Previne o envio padrão do formulário
            
            const formData = new FormData(this); // Cria um objeto FormData para capturar os dados do formulário
            
            fetch('enviar_email.php', { // Envia os dados para o servidor
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`); // Lida com erros de resposta
                }
                return response.json(); // Converte a resposta para JSON
            })
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message); // Mostra mensagem de sucesso
                    form.reset(); // Limpa o formulário
                } else {
                    alert(data.message || 'Ocorreu um erro ao enviar a mensagem.');
                }
            })
            .catch(error => {
                console.error('Erro:', error); // Mostra erro no console
                alert('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.');
            });
        });
    }

    // Configura animação de fade-in para elementos ao entrarem na viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Percentual de visibilidade necessário para ativar a animação
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { // Verifica se o elemento entrou na viewport
                entry.target.classList.add('fade-in'); // Adiciona classe para ativar animação
                observer.unobserve(entry.target); // Para de observar o elemento após animá-lo
            }
        });
    }, observerOptions);

    // Observa todos os elementos com a classe '.fade-in-section' para aplicar a animação
    document.querySelectorAll('.fade-in-section').forEach(el => {
        observer.observe(el);
    });

    // Toggle para abrir/fechar o menu mobile
    const menuToggle = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (menuToggle && navbarCollapse) {
        menuToggle.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show'); // Alterna a classe 'show' para abrir/fechar o menu
        });
    }

    // Fecha o menu mobile ao clicar fora dele
    document.addEventListener('click', function(event) {
        const isClickInsideNavbar = navbar.contains(event.target);
        if (!isClickInsideNavbar && navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
        }
    });

    // Adiciona classe 'active' ao link da navegação quando a seção correspondente estiver visível
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    window.addEventListener('scroll', () => {
        let current = ''; // Inicializa a variável para a seção atual
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - sectionHeight / 3) { // Verifica se a seção está visível
                current = section.getAttribute('id'); // Atualiza a seção atual
            }
        });

        // Remove a classe 'active' de todos os links e adiciona ao link correspondente à seção visível
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
});

// API de Notícias
const API_KEY = '830e5ae91f493a22d6596c04e741006d';
const API_URL = `https://gnews.io/api/v4/search?q=advocacia&lang=pt&country=br&max=10&apikey=${API_KEY}`;

// Variáveis para controle do slider de notícias
let isAutoPlay = true;
let currentIndex = 0;

// Função assíncrona para buscar notícias
async function buscarNoticias() {
    try {
        const response = await fetch(API_URL); // Faz requisição à API
        const data = await response.json(); // Converte a resposta para JSON
        
        const sliderContainer = document.querySelector('.noticias-slider'); // Seleciona o container do slider
        
        data.articles.forEach(artigo => { // Cria um card para cada notícia recebida
            const card = document.createElement('div');
            card.className = 'noticia-card';
            card.innerHTML = `
                <div class="noticia-imagem" style="background-image: url('${artigo.image}')"></div>
                <div class="noticia-conteudo">
                    <h3 class="noticia-titulo">${artigo.title}</h3>
                    <p class="noticia-descricao">${artigo.description}</p>
                </div>
            `;
            sliderContainer.appendChild(card);
        });

        setupSlider(); // Configura o slider após carregar as notícias
    } catch (error) {
        console.error('Erro ao buscar notícias:', error); // Mostra erro no console se a busca falhar
    }
}

// Configura o slider de notícias
function setupSlider() {
    const slider = document.querySelector('.noticias-slider');
    const prevButton = document.querySelector('.slider-arrow.prev');
    const nextButton = document.querySelector('.slider-arrow.next');
    const cards = slider.querySelectorAll('.noticia-card');
    const totalCards = cards.length;

    // Função para mover o slider em uma direção específica
    function moveSlider(direction) {
        currentIndex = (currentIndex + direction + totalCards) % totalCards;
        updateSliderPosition(); // Atualiza a posição do slider
    }

    // Atualiza a posição do slider
    function updateSliderPosition() {
        const cardWidth = cards[0].offsetWidth + 30; // Considera a largura do card e a margem
        slider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }

    // Adiciona eventos para os botões de navegação do slider
    prevButton.addEventListener('click', () => moveSlider(-1));
    nextButton.addEventListener('click', () => moveSlider(1));

    // Pausa o autoplay do slider ao passar o mouse
    slider.addEventListener('mouseenter', () => isAutoPlay = false);
    slider.addEventListener('mouseleave', () => isAutoPlay = true);

    // Função para autoplay do slider
    function autoPlay() {
        if (isAutoPlay) {
            moveSlider(1);
        }
        setTimeout(autoPlay, 5000); // Intervalo de 5 segundos para autoplay
    }

    autoPlay(); // Inicia o autoplay

    // Atualiza a posição do slider ao redimensionar a janela
    window.addEventListener('resize', updateSliderPosition);
}

// Chama a função para buscar notícias ao carregar o DOM
document.addEventListener('DOMContentLoaded', buscarNoticias);

//Código para Atualizar o Ano copyright
document.getElementById("ano").textContent = new Date().getFullYear();

