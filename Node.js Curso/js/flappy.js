
// Cria um novo elemento com o tipo de tag e sua classe.
function NovoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

// Verifica a ordem da barreira e adiciona no front a borda e o corpo dos canos.
function Barreira(reversa = true) {
    this.elemento = NovoElemento('div', 'barreira')

    const borda = NovoElemento('div', 'borda')
    const corpo = NovoElemento('div', 'corpo')

    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)
    
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// Cria o par das barreiras (inferior e superior) com tamanhos semi-aleatórios
function ParDeBarreiras(altura, abertura, x) {
    this.elemento = NovoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    // Pega a posição X, tirando os px da string.
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`

    // Pega a largura do elemento.
    this.getLargura = () => this.elemento.clientWidth

    // Sorteia o tamanho das aberturas e dos canos.
    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    // Primeiras barreiras criadas, estas serão reutilizadas em vez de criar e deixar o game pesado
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    // Quantidade de pixeis de deslocamento das barreiras.
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // Quando o cano sair da tela do jogo.
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            
            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if (cruzouOMeio) notificarPonto()
        })
    }
}

function Passaro(alturaDoJogo) {
    let voando = false

    // Criando o pássaro
    this.elemento = NovoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'
    
    // Pega a posição Y do pássaro.
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    // Evento de pressionar faz ele voar e quando soltar a tecla ele desce.
    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaDoJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } // Não deixa passar além da tela.
        else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        }
        else {
            this.setY(novoY)
        }
    }

    this.setY(alturaDoJogo / 2)
}

function Progresso() {
    this.elemento = NovoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function Sobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

        return horizontal && vertical
}

function Colisao(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = Sobrepostos(passaro.elemento, superior)
                || Sobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function Restart() {
    this.elemento = NovoElemento('img', 'restart')
    this.elemento.src = 'imgs/restart.png'
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))

    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // Loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (Colisao(passaro, barreiras)) {
                clearInterval(temporizador)

                const botaoReset = new Restart()
                areaDoJogo.appendChild(botaoReset.elemento)

                const restart = document.querySelector('.restart').addEventListener("click", () => {
                    location.reload()
                })
            }
        }, 20)
    }
}

new FlappyBird().start()