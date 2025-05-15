import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

let alunos = [];

// Rota para cadastrar um aluno
app.post('/cadastrar-aluno', (req, res) => {
    const aluno = req.body;

    // Verifica se o email já existe
    if (alunos.find(a => a.email === aluno.email)) {
        return res.status(400).json({ error: "Aluno já cadastrado!" });
    }

    alunos.push(aluno);
    res.json({ message: "Aluno cadastrado com sucesso!" });
});

// Rota para buscar todos os alunos
app.get('/alunos', (req, res) => {
    res.json(alunos);
});

// Rota para editar um aluno
app.put('/alunos/:email', (req, res) => {
    const email = req.params.email;
    const alunoIndex = alunos.findIndex(a => a.email === email);

    if (alunoIndex === -1) {
        return res.status(404).json({ error: "Aluno não encontrado!" });
    }

    alunos[alunoIndex] = { ...alunos[alunoIndex], ...req.body };
    res.json({ message: "Aluno atualizado com sucesso!" });
});

// Rota para remover um aluno
app.delete('/alunos/:email', (req, res) => {
    const email = req.params.email;
    const alunoIndex = alunos.findIndex(a => a.email === email);

    if (alunoIndex === -1) {
        return res.status(404).json({ error: "Aluno não encontrado!" });
    }

    alunos.splice(alunoIndex, 1);
    res.json({ message: "Aluno removido com sucesso!" });
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));