function adicionarCard(aluno) {
    const lista = document.getElementById('listaAlunos');

    if (!lista || document.getElementById(`card-${aluno.email}`)) return;

    const card = document.createElement('div');
    card.classList.add('card');
    card.id = `card-${aluno.email}`;
    card.innerHTML = `
        <strong>${aluno.nome}</strong><br>
        Idade: ${aluno.idade}<br>
        Email: ${aluno.email}<br>
        Telefone: ${aluno.telefone}<br>
        Endereço: ${aluno.endereco}<br>
        Curso: ${aluno.curso}<br>
        Data de Nascimento: ${aluno.dataNascimento}<br>
        Saúde: ${aluno.saude}<br>
        Problemas Alimentares: ${aluno.problemasAlimentares}<br>
        <button onclick="removerAluno('${aluno.email}')">Remover</button>
    `;
    lista.appendChild(card);
}

function coletarDadosAluno() {
    const campos = ['nome', 'idade', 'email', 'telefone', 'endereco', 'curso', 'dataNascimento', 'saude', 'problemasAlimentares'];
    let aluno = {};

    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        aluno[campo] = elemento ? elemento.value : "";
    });

    return aluno;
}

document.getElementById('cadastroAluno')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const aluno = coletarDadosAluno();
    if (!aluno.email) return;

    try {
        const resposta = await fetch('http://localhost:3000/cadastrar-aluno', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aluno)
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert(dados.message);
            adicionarCard(aluno);
            salvarLocalmente([...carregarLocalmente(), aluno]);
        } else {
            alert(dados.error);
        }
    } catch (error) {
        console.error("Erro ao cadastrar aluno:", error);
        alert("Erro ao conectar ao servidor.");
    }
});

async function removerAluno(email) {
    if (!confirm(`Tem certeza que deseja remover o aluno com o e-mail ${email}?`)) {
        return;
    }

    try {
        const resposta = await fetch(`http://localhost:3000/alunos/${email}`, { method: 'DELETE' });

        if (!resposta.ok) {
            const erro = await resposta.json();
            alert(`Erro ao remover aluno: ${erro.error || "Erro desconhecido"}`);
            return;
        }

        document.getElementById(`card-${email}`)?.remove();
        salvarLocalmente(carregarLocalmente().filter(a => a.email !== email));

        alert("Aluno removido com sucesso!");
    } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        alert("Erro ao conectar ao servidor.");
    }
}

function salvarLocalmente(alunos) {
    localStorage.setItem("alunos", JSON.stringify(alunos));
}

function carregarLocalmente() {
    const dados = localStorage.getItem("alunos");
    return dados ? JSON.parse(dados) : [];
}

async function alterarDadosAluno(email, novosDados) {
    try {
        const resposta = await fetch(`http://localhost:3000/alunos/${email}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novosDados)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(`Erro ao atualizar aluno: ${dados.error || "Erro desconhecido"}`);
            return;
        }

        const alunosAtualizados = carregarLocalmente().map(aluno =>
            aluno.email === email ? { ...aluno, ...novosDados } : aluno
        );
        salvarLocalmente(alunosAtualizados);

        document.getElementById(`card-${email}`)?.remove();
        adicionarCard({ email, ...novosDados });

        alert("Dados do aluno alterados com sucesso!");
    } catch (error) {
        console.error("Erro ao alterar aluno:", error);
        alert("Erro ao conectar ao servidor.");
    }
}

async function carregarAlunos() {
    const alunosSalvos = carregarLocalmente();
    alunosSalvos.forEach(adicionarCard);

    try {
        const resposta = await fetch('http://localhost:3000/alunos');
        if (!resposta.ok) throw new Error("Falha ao carregar alunos.");

        const alunos = await resposta.json();
        salvarLocalmente(alunos);

        const lista = document.getElementById('listaAlunos');
        if (lista) {
            lista.innerHTML = "";
            alunos.forEach(adicionarCard);
        }
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
    }
}

// Função de pesquisa por nome
document.getElementById('botaoPesquisar')?.addEventListener('click', function () {
    const termoPesquisa = document.getElementById('pesquisa').value.toLowerCase();
    const lista = document.getElementById('listaAlunos');
    lista.innerHTML = ""; 

    const alunosSalvos = carregarLocalmente();
    const resultados = alunosSalvos.filter(aluno => aluno.nome.toLowerCase().includes(termoPesquisa));

    if (resultados.length === 0) {
        lista.innerHTML = "<p>Nenhum aluno encontrado.</p>";
    } else {
        resultados.forEach(adicionarCard);
    }
});

// Função para limpar pesquisa
document.getElementById('botaoLimparPesquisa')?.addEventListener('click', function () {
    document.getElementById('pesquisa').value = ""; 
    const lista = document.getElementById('listaAlunos');
    lista.innerHTML = ""; 

    const alunosSalvos = carregarLocalmente();
    alunosSalvos.forEach(adicionarCard);
});

window.addEventListener("DOMContentLoaded", carregarAlunos);